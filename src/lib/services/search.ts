import { Producer, ScannedData } from '@/types';

// Mock Search Service -> Now returning "Smart Links"
export async function findProducerInfo(scannedData: ScannedData): Promise<Producer> {
  // Simulate search API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const brand = scannedData.brand || "Unknown";
  const searchQuery = encodeURIComponent(`${brand} wine producer`);
  
  if (brand.toLowerCase().includes('glenfiddich')) {
    return {
      name: "William Grant & Sons",
      region: "Speyside, Scotland",
      website: "https://www.glenfiddich.com",
      description: "Glenfiddich means 'Valley of the Deer' in Gaelic. The distillery was founded in 1886 by William Grant."
    };
  }

  // Dynamic Fallback with Search Link
  return {
    name: brand,
    website: `https://www.google.com/search?q=${searchQuery}`,
    description: `Klik om meer informatie over ${brand} te zoeken op Google.`
  };
}

export async function findVivinoData(scannedData: ScannedData) {
    // Simulate Vivino lookup
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const query = `${scannedData.brand || ''} ${scannedData.productName || ''} ${scannedData.vintage || ''}`.trim();
    const searchUrl = `https://www.vivino.com/search/wines?q=${encodeURIComponent(query)}`;

    // If we have a very specific mock match (Glenfiddich), keep it for demo
    if (scannedData.brand?.toLowerCase().includes('glenfiddich') && scannedData.productName?.includes('12')) {
         return {
            score: 4.1,
            reviews: 1250,
            highlights: ["Smooth", "Fruity", "Pear notes"],
            url: "https://www.vivino.com/glenfiddich-12-year-old-single-malt-scotch-whisky/w/6697"
        };
    }

    // Generic "Search on Vivino" result
    return {
        score: 0, // 0 indicates "Check Vivino"
        reviews: 0,
        highlights: ["Tap to search"],
        url: searchUrl
    };
}

