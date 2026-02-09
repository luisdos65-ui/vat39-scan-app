import { ScannedData } from '@/types';
// Remove top-level import to prevent server-side build issues
// import Tesseract from 'tesseract.js';

// Real implementation using Tesseract.js (Client-side OCR)
export async function extractDataFromImage(imageFile: File): Promise<ScannedData> {
  console.log('Processing image with Tesseract:', imageFile.name);

  try {
    // Check if Tesseract is loaded from CDN, with retry mechanism
    let Tesseract = (window as any).Tesseract;
    
    if (!Tesseract) {
        console.log("Tesseract not ready, waiting...");
        // Poll for up to 3 seconds
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 100));
            Tesseract = (window as any).Tesseract;
            if (Tesseract) break;
        }
    }

    if (!Tesseract) {
        throw new Error("Tesseract library could not be loaded. Please check your internet connection.");
    }

    // Timeout race to prevent hanging forever
    const timeoutPromise = new Promise<ScannedData>((_, reject) => 
        setTimeout(() => reject(new Error('OCR Timeout')), 25000)
    );

    // Helper to resize and preprocess image
    const preprocessImage = (file: File, mode: 'grayscale' | 'binary' = 'grayscale'): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 1800;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                if (mode === 'grayscale') {
                    // Preprocessing: Grayscale + High Contrast
                    const contrast = 1.2; 
                    const intercept = 128 * (1 - contrast);
                    for (let i = 0; i < data.length; i += 4) {
                        let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                        gray = gray * contrast + intercept;
                        gray = Math.max(0, Math.min(255, gray));
                        data[i] = data[i + 1] = data[i + 2] = gray;
                    }
                } else if (mode === 'binary') {
                    // Preprocessing: Adaptive Thresholding (Simple Binarization)
                    // First pass: Calculate average brightness
                    let totalBrightness = 0;
                    for (let i = 0; i < data.length; i += 4) {
                        totalBrightness += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    }
                    const avgBrightness = totalBrightness / (data.length / 4);
                    
                    // Second pass: Apply threshold
                    const threshold = avgBrightness * 0.9; // Slightly lower than average to keep text (usually dark on light)
                    // Note: If text is light on dark, this might need inversion. 
                    // For now assume standard label (dark text on light paper) or rely on Tesseract's ability to handle inverted.
                    
                    for (let i = 0; i < data.length; i += 4) {
                        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                        const val = gray < threshold ? 0 : 255;
                        data[i] = data[i + 1] = data[i + 2] = val;
                    }
                }

                ctx.putImageData(imageData, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob failed'));
                }, 'image/jpeg', 0.9);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    const runOCR = async (blob: Blob) => {
         return await Tesseract.recognize(
            blob,
            'eng+nld+fra', 
            { logger: m => console.log(m) }
        );
    };

    const recognitionPromise = (async () => {
        // Attempt 1: Grayscale (Better for photos with shadows)
        console.log("OCR Attempt 1: Grayscale");
        const grayBlob = await preprocessImage(imageFile, 'grayscale');
        let result = await runOCR(grayBlob);

        // Check quality
        if (result.data.confidence < 60 || result.data.text.trim().length < 10) {
            console.log("OCR Low Confidence/Text. Retrying with Binary...");
            // Attempt 2: Binary (Better for high contrast/noisy backgrounds)
            const binaryBlob = await preprocessImage(imageFile, 'binary');
            const binaryResult = await runOCR(binaryBlob);
            
            // If binary result is better (more text or higher confidence), use it
            if (binaryResult.data.text.trim().length > result.data.text.trim().length) {
                console.log("Using Binary Result");
                result = binaryResult;
            }
        }
        return result;
    })();

    const result: any = await Promise.race([recognitionPromise, timeoutPromise]);
    
    const text = result.data.text;
    const lines = result.data.lines || [];
    console.log("OCR Text:", text);

    // Advanced Parsing using Bounding Boxes and Confidence
    const IGNORED_TERMS = [
        'product of', 'produit de', 'contains', 'bevat', 'sulfites', 'sulfieten',
        'vol', 'alc', 'cl', 'ml', 'l', '750', '700', '500', 'year', 'old', 'aged',
        'appellation', 'controlee', 'protected', 'origin', 'bottled', 'mis en bouteille',
        'grand vin', 'selection', 'reserve', 'family',
        'fine', 'spirits', 'distilled', 'blended', 'since', 'anno', 'estd',
        'import', 'export', 'quality', 'premium', 'superior'
    ];
    // REMOVED from ignore list: 'chateau', 'domaine', 'estate', 'tenuta', 'bodega', 'wine'

    // Helper to clean garbage text
    const cleanLine = (text: string) => {
        // Remove pipe characters, brackets, common OCR noise
        return text.replace(/[|\[\]{}_=<>~]/g, '').trim();
    };

    const isGarbage = (text: string) => {
        if (!text) return true;
        // Check for meaningful content (at least 3 alphanumeric chars)
        const alphaNumeric = text.replace(/[^a-zA-Z0-9]/g, '');
        if (alphaNumeric.length < 3) return true;
        
        // Check ratio of symbols to length
        const symbols = text.replace(/[a-zA-Z0-9\s.,-]/g, '').length;
        if (symbols > text.length * 0.3) return true; // >30% symbols is garbage

        return false;
    };

    // Filter valid lines
    let validLines = lines
        .map((line: any) => ({ ...line, text: cleanLine(line.text) })) // Clean first
        .filter((line: any) => {
            const txt = line.text.toLowerCase();
            if (isGarbage(line.text)) return false;
            
            // Remove lines that are purely technical info (vol, abv)
            if (txt.match(/^(\d{1,2}[.,]?\d{0,1})\s?%/) || txt.match(/(\d{2,4})\s?(cl|ml|l)/)) return false;
            return true;
    });

    // Calculate height for each line (to find the biggest text -> likely Brand)
    validLines = validLines.map((line: any) => ({
        ...line,
        height: line.bbox.y1 - line.bbox.y0
    }));

    // Sort by height (descending)
    validLines.sort((a: any, b: any) => b.height - a.height);

    let brand = "Onbekend Merk";
    let productName = "Onbekend Product";

    // Best guess: Largest text is Brand, 2nd largest is Product Name (if not ignored)
    if (validLines.length > 0) {
        // Find first line that isn't a common keyword
        // Prioritize lines starting with known prefixes
        const PRIORITY_PREFIXES = ['chateau', 'domaine', 'tenuta', 'bodega', 'finca', 'villa', 'castello'];
        
        const brandCandidate = validLines.find((l: any) => {
             const t = l.text.toLowerCase();
             // If it starts with a priority prefix, IT IS THE BRAND (almost certainly)
             if (PRIORITY_PREFIXES.some(p => t.startsWith(p))) return true;
             
             // Otherwise check ignore list
             return !IGNORED_TERMS.some(term => t.includes(term));
        }) || validLines[0];

        brand = brandCandidate.text.trim();

        // Find second largest for product name
        const productCandidate = validLines.find((l: any) => 
            l !== brandCandidate && 
            !IGNORED_TERMS.some(term => l.text.toLowerCase().includes(term))
        );
        
        if (productCandidate) {
            productName = productCandidate.text.trim();
        } else if (validLines.length > 1 && validLines[1] !== brandCandidate) {
            productName = validLines[1].text.trim();
        }
    } else if (lines.length > 0) {
        // Fallback: Use the line with highest confidence
        const sortedByConf = [...lines].sort((a: any, b: any) => b.confidence - a.confidence);
        brand = sortedByConf[0].text.trim();
        if (sortedByConf.length > 1) productName = sortedByConf[1].text.trim();
    }

    // Heuristic: Only fail if ABSOLUTELY no text
    if (text.length < 2 && lines.length === 0) {
        throw new Error("No text found");
    }
    
    // Extract metadata from full text
    const vintageMatch = text.match(/(19|20)\d{2}/);
    const vintage = vintageMatch ? vintageMatch[0] : undefined;

    const abvMatch = text.match(/(\d{1,2}[.,]?\d{0,1})\s?%/);
    const abv = abvMatch ? `${abvMatch[1]}%` : undefined;

    const volMatch = text.match(/(\d{2,4})\s?(cl|ml|l)/i);
    const volume = volMatch ? volMatch[0] : undefined;

    return {
        rawText: text,
        // ALLOW accents and international characters (removed strict regex)
        brand: brand.trim(), 
        productName: productName.trim(),
        category: "Wijn / Gedistilleerd",
        abv,
        volume,
        vintage,
        confidence: result.data.confidence > 70 ? 'high' : 'medium'
    };

  } catch (error) {
    console.error("OCR Error or Timeout:", error);
    // Return low confidence to trigger the Robust Fallback in product.ts
    return {
        rawText: "Error reading text",
        brand: "Scan Mislukt",
        productName: "Probeer opnieuw",
        confidence: 'low'
    };
  }
}
