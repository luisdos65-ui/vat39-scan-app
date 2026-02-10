import { Producer, ScannedData, VivinoData } from '@/types';

// Mock Search Service -> Now returning "Smart Links" or simulating LLM extraction
export async function findProducerInfo(scannedData: ScannedData): Promise<Producer> {
  // Simulate search API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const brand = (scannedData.brand && scannedData.brand !== 'Onbekend Merk') 
    ? scannedData.brand 
    : scannedData.rawText.substring(0, 50).replace(/\n/g, ' ');

  const searchQuery = encodeURIComponent(`${brand} wine producer`);
  
  // Simulated "Verified" Database
  if (brand?.toLowerCase().includes('glenfiddich')) {
    return {
      name: "William Grant & Sons",
      type: "Distillery",
      country: "Scotland",
      region: "Speyside",
      website: "https://www.glenfiddich.com",
      about: "Glenfiddich means 'Valley of the Deer' in Gaelic. The distillery was founded in 1886 by William Grant.",
      description: "Glenfiddich means 'Valley of the Deer' in Gaelic. The distillery was founded in 1886 by William Grant.",
      citations: [
        { url: "https://www.glenfiddich.com", quote: "Founded in 1886 by William Grant" }
      ]
    };
  }

  // Generic "Smart" Match for Common Wine Terms
  if (brand?.match(/chateau|domaine|tenuta|bodega|vina|estate|cascina|finca/i)) {
      return {
          name: brand,
          type: "Wijnhuis",
          country: "Wijnstreek", // Generic
          website: `https://www.google.com/search?q=${searchQuery}`,
          about: "Een erkend wijnhuis. Klik op de website link voor specifieke details over de historie en wijngaarden.",
          description: "Een erkend wijnhuis. Klik op de website link voor specifieke details over de historie en wijngaarden.",
          citations: []
      };
  }

  // Generic Match for Spirits
  if (brand?.match(/whisky|whiskey|gin|vodka|rum|cognac|brandy|liqueur/i) || 
      scannedData.rawText.match(/whisky|whiskey|gin|vodka|rum/i)) {
      return {
          name: brand || "Gedistilleerd",
          type: "Sterke Drank",
          website: `https://www.google.com/search?q=${searchQuery}`,
          about: "Een gedistilleerde drank. Scan een specifieker merk of zoek handmatig voor meer details.",
          description: "Een gedistilleerde drank. Scan een specifieker merk of zoek handmatig voor meer details.",
          citations: []
      };
  }

  // Dynamic Fallback with Search Link (simulating "PARTIAL" or "UNKNOWN" status)
  // IMPROVEMENT: If we have a brand name, use it! Don't just say "Onbekend".
  let displayName = (brand && brand !== 'Onbekend Merk') ? brand : "Onbekend";
  
  // Extra garbage check for producer name (preventing OCR noise like | ' | e |)
  if (displayName.length < 3 || displayName.match(/[|{}[\]]/)) {
      displayName = "Onbekend";
  }

  const isUnknown = displayName === "Onbekend";

  return {
    name: displayName,
    type: !isUnknown ? "Wijnproducent" : "Onbekend",
    website: `https://www.google.com/search?q=${searchQuery}`,
    about: !isUnknown 
        ? `Klik om meer informatie over ${displayName} te zoeken op Google.` 
        : "Kon de producent niet identificeren. Gebruik de zoekfunctie om handmatig te zoeken.",
    description: !isUnknown 
        ? `Klik om meer informatie over ${displayName} te zoeken op Google.` 
        : "Kon de producent niet identificeren. Gebruik de zoekfunctie om handmatig te zoeken.",
    citations: []
  };
}

export async function findVat39Recommendation(scannedData: ScannedData): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const brand = scannedData.brand?.toLowerCase() || '';
    
    if (brand.includes('glenfiddich')) {
        return "De 12 jaar oude Glenfiddich is het schoolvoorbeeld van een Speyside single malt. Vat39 adviseert deze fles vanwege zijn constante kwaliteit en toegankelijke karakter met tonen van peer en eik.";
    }

    if (brand.includes('chateau') || brand.includes('domaine')) {
        return "Een klassieke Franse wijn die perfect past in ons assortiment van traditionele wijnhuizen. Geselecteerd door onze specialisten vanwege de uitstekende prijs-kwaliteitverhouding.";
    }

    // For unknown brands, do not return a fake recommendation
    if (!brand || brand === 'onbekend merk' || brand === 'unknown') {
        return "";
    }

    return "Geselecteerd door Vat39 De Specialist vanwege het unieke karakter en de authentieke productiemethode. Een aanwinst voor elke liefhebber.";
}

export async function findProductionMethod(scannedData: ScannedData): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const text = scannedData.rawText.toLowerCase();
    const brand = scannedData.brand?.toLowerCase() || '';
    
    // If brand is unknown and we have very little text, don't return generic method
    if ((!brand || brand === 'onbekend merk' || brand === 'unknown') && text.length < 20) {
        return "";
    }
    
    if (text.includes('whisky') || text.includes('malt')) {
        return "Gedistilleerd in koperen pot stills en jarenlang gerijpt op eikenhouten vaten voor een rijke, complexe smaakontwikkeling.";
    }

    if (text.includes('red') || text.includes('rouge') || text.includes('rosso')) {
        return "Gemaakt van zorgvuldig geselecteerde druiven, met een traditionele vergisting op de schillen om kleur en tannines te extraheren.";
    }

    if (text.includes('white') || text.includes('blanc') || text.includes('bianco')) {
        return "Geproduceerd via koude vergisting op roestvrijstalen tanks om de frisse fruitaroma's optimaal te behouden.";
    }

    // Only return generic method if we have some confidence it's a beverage
    if (text.length > 20) {
        return "Geproduceerd volgens traditionele methoden met respect voor het terroir en de natuurlijke omgeving.";
    }
    
    return "";
}

export async function findVivinoData(scannedData: ScannedData): Promise<VivinoData> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 600));

    const brand = scannedData.brand?.toLowerCase() || '';
    
    // Simulate high score for Glenfiddich
    if (brand.includes('glenfiddich')) {
        return {
            score: 4.6,
            reviews: 12500,
            url: 'https://www.vivino.com/wines/glenfiddich-12-year-old-single-malt-scotch-whisky',
            top_reviews: [
                { user: "WhiskyLover99", rating: 5, text: "Excellent daily dram. Pear and oak notes.", date: "2023-10-15" },
                { user: "Jan de Vries", rating: 4, text: "Prima prijs-kwaliteit verhouding.", date: "2023-09-20" }
            ]
        };
    }

    // Generic score for others - BUT only if we have a valid brand
  // If brand is Unknown, return null to avoid showing fake reviews for "Onbekend"
  // Note: brand is already lowercased here
  if (!brand || brand === 'onbekend merk' || brand === 'onbekend' || brand === 'unknown') {
      return null as any; 
  }

  return {
      score: 4.0, // Default "Good" score
      reviews: Math.floor(Math.random() * 500) + 50,
      url: `https://www.vivino.com/search/wines?q=${encodeURIComponent(brand)}`,
      top_reviews: [
          { user: "WijnGenieter", rating: 4, text: "Aangename verrassing, soepel en fruitig.", date: "2023-11-01" },
          { user: "Sophie", rating: 4.5, text: "Heerlijk bij het diner!", date: "2023-10-28" }
      ]
  };
}

