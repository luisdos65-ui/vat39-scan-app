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
  return {
    name: brand || "Onbekend",
    website: `https://www.google.com/search?q=${searchQuery}`,
    about: `Klik om meer informatie over ${brand} te zoeken op Google.`,
    description: `Klik om meer informatie over ${brand} te zoeken op Google.`
  };
}

export async function findVivinoData(scannedData: ScannedData): Promise<VivinoData> {
    // Simulate Vivino lookup
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const queryTerm = (scannedData.brand && scannedData.brand !== 'Onbekend Merk')
        ? `${scannedData.brand || ''} ${scannedData.productName || ''} ${scannedData.vintage || ''}`
        : scannedData.rawText.substring(0, 100).replace(/\n/g, ' ');

    const query = queryTerm.trim();
    const searchUrl = `https://www.vivino.com/search/wines?q=${encodeURIComponent(query)}`;

    // If we have a very specific mock match (Glenfiddich), keep it for demo
    if (scannedData.brand?.toLowerCase().includes('glenfiddich') && scannedData.productName?.includes('12')) {
         return {
            score: 4.1,
            reviews: 1250,
            highlights: ["Smooth", "Fruity", "Pear notes"],
            top_reviews: [
                { rating: 5, text: "Excellent entry level malt.", user: "John D.", date: "2023-10-01" },
                { rating: 4, text: "Classic Speyside.", user: "Jane S.", date: "2023-09-15" }
            ],
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

export async function findVat39Recommendation(scannedData: ScannedData): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const brand = scannedData.brand?.toLowerCase() || '';
    
    if (brand.includes('glenfiddich')) {
        return "De 12 jaar oude Glenfiddich is het schoolvoorbeeld van een Speyside single malt. Vat39 adviseert deze fles vanwege zijn constante kwaliteit en toegankelijke karakter met tonen van peer en eik.";
    }

    if (brand.includes('chateau') || brand.includes('domaine')) {
        return "Een klassieke Franse wijn die perfect past in ons assortiment van traditionele wijnhuizen. Geselecteerd door onze specialisten vanwege de uitstekende prijs-kwaliteitverhouding.";
    }

    return "Geselecteerd door Vat39 De Specialist vanwege het unieke karakter en de authentieke productiemethode. Een aanwinst voor elke liefhebber.";
}

export async function findProductionMethod(scannedData: ScannedData): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const text = scannedData.rawText.toLowerCase();
    
    if (text.includes('whisky') || text.includes('malt')) {
        return "Gedistilleerd in koperen pot stills en jarenlang gerijpt op eikenhouten vaten voor een rijke, complexe smaakontwikkeling.";
    }

    if (text.includes('red') || text.includes('rouge') || text.includes('rosso')) {
        return "Gemaakt van zorgvuldig geselecteerde druiven, met een traditionele vergisting op de schillen om kleur en tannines te extraheren.";
    }

    if (text.includes('white') || text.includes('blanc') || text.includes('bianco')) {
        return "Geproduceerd via koude vergisting op roestvrijstalen tanks om de frisse fruitaroma's optimaal te behouden.";
    }

    return "Ambachtelijk geproduceerd volgens traditionele methoden, waarbij kwaliteit en vakmanschap centraal staan in elke stap van het proces.";
}

