import { ScannedData } from '@/types';
import { compressImage } from '@/lib/utils';
// Remove top-level import to prevent server-side build issues
// import Tesseract from 'tesseract.js';

// Real implementation using Tesseract.js (Client-side OCR) AND OpenAI GPT-4o (Server-side AI)
export async function extractDataFromImage(imageFile: File): Promise<ScannedData> {
  console.log('Processing image...', imageFile.name);

  // 1. Try AI Analysis (OpenAI) First
  try {
      console.log("Attempting AI analysis (GPT-4o)...");
      
      // COMPRESS IMAGE FIRST!
      // Vercel Serverless Function Payload Limit is 4.5MB.
      // High-res camera photos can easily exceed this.
      // Resize to max 1024px and 0.8 quality -> usually < 500KB
      const base64DataUrl = await compressImage(imageFile, 1024, 0.8);
      
      // Convert Data URL to Blob/File for FormData
      const res = await fetch(base64DataUrl);
      const blob = await res.blob();
      const compressedFile = new File([blob], "compressed.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append('image', compressedFile);

      const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData
      });

      if (response.ok) {
          const data = await response.json();
          console.log("AI Result:", data);
          
          if (data.brand && data.brand !== "null") {
              return {
                  rawText: JSON.stringify(data),
                  brand: data.brand,
                  productName: data.productName || "",
                  category: data.type || "Wijn / Gedistilleerd",
                  abv: data.abv ? `${data.abv}` : undefined,
                  volume: data.volume ? `${data.volume}` : undefined,
                  vintage: data.vintage ? `${data.vintage}` : undefined,
                  confidence: 'high',
                  scanMethod: 'openai'
              };
          }
      } else {
          const errorText = await response.text();
          console.warn("AI analysis failed:", response.status, errorText);
          
          // Propagate configuration error explicitly to UI if possible, or log critical warning
          if (response.status === 500 && errorText.includes("OPENAI_API_KEY")) {
              console.error("CRITICAL: OPENAI_API_KEY is missing in server environment!");
              // We could throw here to stop fallback if we want to force config fix, 
              // but for end-users, fallback to OCR is better than crash.
              // Just ensure we don't silence this specific error in logs.
          }
      }
  } catch (e) {
      console.error("AI Analysis Error:", e);
      // STOP! Do not fall back to Tesseract if AI fails.
      // User explicitly requested to use AI (ChatGPT).
      // Fallback causes bad user experience ("Onbekend Merk").
      throw new Error("AI Analyse mislukt (Server/API fout). Controleer internet en configuratie.");
  }

  // UNREACHABLE CODE (Tesseract Fallback Removed)
  throw new Error("Tesseract Fallback disabled.");
  
  /* 
  console.log('Falling back to Tesseract OCR...');
  try {
    // ... Tesseract Logic ...
  }
  */
}

  } catch (error) {
    console.error("OCR Error or Timeout:", error);
    // Return low confidence to trigger the Robust Fallback in product.ts
    // MODIFIED: If OCR fails, we want to know it explicitly to show "AI Failed"
    throw error;
  }
}
