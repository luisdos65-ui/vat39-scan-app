import { ScannedData } from '@/types';
import Tesseract from 'tesseract.js';

// Real implementation using Tesseract.js (Client-side OCR)
export async function extractDataFromImage(imageFile: File): Promise<ScannedData> {
  console.log('Processing image with Tesseract:', imageFile.name);

  try {
    const result = await Tesseract.recognize(
      imageFile,
      'eng', // Using English as it captures most wine labels well, 'nld' is also an option but eng is safer for international brands
      { logger: m => console.log(m) }
    );

    const text = result.data.text;
    console.log("OCR Result:", text);

    // Basic heuristic parsing
    const lines = text.split('\n').filter(l => l.trim().length > 2);
    
    // Find potential vintage (4 digits starting with 19 or 20)
    const vintageMatch = text.match(/(19|20)\d{2}/);
    const vintage = vintageMatch ? vintageMatch[0] : undefined;

    // Find ABV (number followed by %)
    const abvMatch = text.match(/(\d{1,2}[.,]?\d{0,1})\s?%/);
    const abv = abvMatch ? `${abvMatch[1]}%` : undefined;

    // Find Volume (number followed by cl or ml)
    const volMatch = text.match(/(\d{2,4})\s?(cl|ml|l)/i);
    const volume = volMatch ? volMatch[0] : undefined;

    // Guess Brand/Name (First meaningful line that isn't a year or volume)
    // This is very rough, but better than hardcoded "Glenfiddich"
    let brand = "Onbekend Merk";
    let productName = "Onbekend Product";

    // Filter out common label noise
    const cleanLines = lines.filter(line => 
        !line.match(/vol/i) && 
        !line.match(/cl|ml/i) && 
        !line.match(/product of/i) &&
        line.length > 3
    );

    if (cleanLines.length > 0) {
        brand = cleanLines[0]; // Assume first big text is brand
        if (cleanLines.length > 1) {
            productName = cleanLines[1];
        }
    }

    return {
        rawText: text,
        brand: brand.replace(/[^a-zA-Z0-9\s]/g, '').trim(),
        productName: productName.replace(/[^a-zA-Z0-9\s]/g, '').trim(),
        category: "Wijn / Gedistilleerd", // Generic fallback
        abv,
        volume,
        vintage,
        confidence: result.data.confidence > 70 ? 'high' : 'medium'
    };

  } catch (error) {
    console.error("OCR Error:", error);
    // Fallback if Tesseract fails completely
    return {
        rawText: "Error reading text",
        brand: "Scan Mislukt",
        productName: "Probeer opnieuw",
        confidence: 'low'
    };
  }
}

