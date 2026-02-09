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

    // Helper to resize image
    const resizeImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 1500;

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
                
                // Note: Tesseract v5/v6 handles binarization well internally.
                // We skip manual grayscale to avoid potential canvas data issues across devices.

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob failed'));
                }, 'image/jpeg', 0.9);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    const recognitionPromise = (async () => {
        // Resize image first to improve performance and stability
        const processedImage = await resizeImage(imageFile);

        const result = await Tesseract.recognize(
            processedImage,
            'eng+nld', 
            { logger: m => console.log(m) }
        );
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
        'estate', 'domaine', 'chateau', 'grand vin', 'selection', 'reserve', 'family',
        'fine', 'wine', 'spirits', 'distilled', 'blended', 'since', 'anno', 'estd',
        'import', 'export', 'quality', 'premium', 'superior'
    ];

    // Filter valid lines
    let validLines = lines.filter((line: any) => {
        const txt = line.text.trim().toLowerCase();
        // Remove short lines or low confidence
        if (txt.length < 3 || line.confidence < 60) return false;
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
        // Find first line that isn't a common keyword (unless it's the ONLY text)
        const brandCandidate = validLines.find((l: any) => {
             const t = l.text.toLowerCase();
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
        // Fallback: If "validLines" filtering was too strict, use raw lines
        // Sort raw lines by confidence or just take top ones
        brand = lines[0].text.trim();
        if (lines.length > 1) productName = lines[1].text.trim();
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
        brand: brand.replace(/[^a-zA-Z0-9\s\-\.]/g, '').trim(),
        productName: productName.replace(/[^a-zA-Z0-9\s\-\.]/g, '').trim(),
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
