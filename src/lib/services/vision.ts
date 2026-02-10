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
                  
                  // New AI Fields
                  description: data.description,
                  tastingNotes: data.tastingNotes,
                  foodPairing: data.foodPairing,
                  vat39Tip: data.vat39Tip,
                  productionMethod: data.productionMethod,
                  producerInfo: data.producer ? {
                      name: data.producer.name || data.brand,
                      type: "Producent",
                      region: data.producer.region,
                      about: data.producer.about,
                      country: data.producer.region?.split(',').pop()?.trim(),
                      citations: []
                  } : undefined,

                  confidence: 'high',
                  scanMethod: 'openai'
              };
          } else {
              throw new Error("AI kon het product niet identificeren.");
          }
      } else {
          const errorText = await response.text();
          console.warn("AI analysis failed:", response.status, errorText);
          
          // Propagate configuration error explicitly
          if (response.status === 500 && errorText.includes("OPENAI_API_KEY")) {
              throw new Error("CRITICAL: OPENAI_API_KEY ontbreekt op Vercel! Voeg deze toe bij Settings > Environment Variables.");
          } else if (response.status === 500) {
              throw new Error("Server Fout (500). Controleer Vercel Logs.");
          }
          
          throw new Error(`AI Request mislukt: ${response.status} ${response.statusText}`);
      }
  } catch (e) {
      console.error("AI Analysis Error:", e);
      // Re-throw the specific error so it reaches the UI
      throw e;
  }

  // UNREACHABLE CODE (Tesseract Fallback Removed)
  throw new Error("Tesseract Fallback disabled.");
}
