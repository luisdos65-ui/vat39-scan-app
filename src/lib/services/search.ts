import { Producer, ScannedData } from '@/types';

// Mock Search Service
export async function findProducerInfo(scannedData: ScannedData): Promise<Producer> {
  // Simulate search API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (scannedData.brand?.toLowerCase().includes('glenfiddich')) {
    return {
      name: "William Grant & Sons",
      region: "Speyside, Scotland",
      website: "https://www.glenfiddich.com",
      description: "Glenfiddich means 'Valley of the Deer' in Gaelic. The distillery was founded in 1886 by William Grant."
    };
  }

  // Fallback / Generic
  return {
    name: scannedData.brand || "Unknown Producer",
    description: "Producer information not found."
  };
}

export async function findVivinoData(scannedData: ScannedData) {
    // Simulate Vivino lookup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        score: 4.2,
        reviews: 3420,
        highlights: ["Oak", "Vanilla", "Pear"],
        url: "https://www.vivino.com"
    };
}
