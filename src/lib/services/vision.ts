import { ScannedData } from '@/types';

// Mock implementation for now
// In production, this would call Google Cloud Vision API or Azure Computer Vision
export async function extractDataFromImage(imageFile: File): Promise<ScannedData> {
  console.log('Processing image:', imageFile.name);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Return mock data based on "random" logic or hardcoded for demo
  return {
    rawText: "GLENFIDDICH SINGLE MALT SCOTCH WHISKY 12 YEARS OLD",
    brand: "Glenfiddich",
    productName: "12 Year Old",
    category: "Single Malt Scotch Whisky",
    abv: "40%",
    volume: "70cl",
    vintage: "12",
    confidence: 'high'
  };
}
