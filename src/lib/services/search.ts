import { Producer, ScannedData } from '@/types';

// Mock Search Service -> Now returning "Smart Links"
export async function findProducerInfo(scannedData: ScannedData): Promise<Producer> {
  // Simulate search API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const brand = (scannedData.brand && scannedData.brand !== 'Onbekend Merk') 
    ? scannedData.brand 
    : scannedData.rawText.substring(0, 50).replace(/\n/g, ' ');

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

