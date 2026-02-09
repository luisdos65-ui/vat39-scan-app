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
        setTimeout(() => reject(new Error('OCR Timeout')), 15000)
    );

    const recognitionPromise = (async () => {
        const result = await Tesseract.recognize(
            imageFile,
            'eng', 
            { logger: m => console.log(m) }
        );
        return result;
    })();

    const result: any = await Promise.race([recognitionPromise, timeoutPromise]);
    
    const text = result.data.text;
    console.log("OCR Result:", text);

    // Basic heuristic parsing
    const lines = text.split('\n').filter((l: string) => l.trim().length > 2);
    
    const vintageMatch = text.match(/(19|20)\d{2}/);
    const vintage = vintageMatch ? vintageMatch[0] : undefined;

    const abvMatch = text.match(/(\d{1,2}[.,]?\d{0,1})\s?%/);
    const abv = abvMatch ? `${abvMatch[1]}%` : undefined;

    const volMatch = text.match(/(\d{2,4})\s?(cl|ml|l)/i);
    const volume = volMatch ? volMatch[0] : undefined;

    let brand = "Onbekend Merk";
    let productName = "Onbekend Product";

    const cleanLines = lines.filter((line: string) => 
        !line.match(/vol/i) && 
        !line.match(/cl|ml/i) && 
        !line.match(/product of/i) &&
        line.length > 3
    );

    if (cleanLines.length > 0) {
        brand = cleanLines[0];
        if (cleanLines.length > 1) {
            productName = cleanLines[1];
        }
    }

    // Heuristic: If we found very little text, assume failure
    if (text.length < 10 || cleanLines.length === 0) {
        throw new Error("Not enough text found");
    }

    return {
        rawText: text,
        brand: brand.replace(/[^a-zA-Z0-9\s]/g, '').trim(),
        productName: productName.replace(/[^a-zA-Z0-9\s]/g, '').trim(),
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
