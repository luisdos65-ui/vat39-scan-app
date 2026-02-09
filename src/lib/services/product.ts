import { Product, ScannedData } from '@/types';
import { findProducerInfo, findVivinoData, findVat39Recommendation, findProductionMethod } from './search';
import { extractDataFromImage } from './vision';
import { DISCOVER_PRODUCTS, MOCK_GLENFIDDICH } from '@/lib/data/mocks';

export async function processTextSearch(query: string): Promise<Product> {
  const scannedData: ScannedData = {
      rawText: query,
      brand: query,
      productName: "",
      confidence: 'high'
  };

  // Parallel fetch for Enrichment
  const [producer, vivino, vat39Rec, production] = await Promise.all([
    findProducerInfo(scannedData),
    findVivinoData(scannedData),
    findVat39Recommendation(scannedData),
    findProductionMethod(scannedData)
  ]);

  return {
    id: crypto.randomUUID(),
    name: query,
    brand: query,
    category: "Gezocht Product",
    image: "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&q=80&w=1000", // Generic search image
    producer,
    vivino,
    vat39Recommendation: vat39Rec,
    productionMethod: production,
    scannedAt: new Date()
  };
}

export async function processScan(imageFile: File): Promise<Product> {
  // 1. Extract data from image (OCR/Vision)
  let scannedData: ScannedData;
  try {
    scannedData = await extractDataFromImage(imageFile);
  } catch (e) {
    console.error("Critical Vision Error", e);
    throw new Error("Scan mislukt. Probeer het opnieuw of zoek handmatig.");
  }

  // ROBUST FALLBACK MODE REMOVED per user request ("neen hij geeft de opgeslagen van het bestand")
  // If OCR fails, we now throw an error so the user knows to retry or search manually.
  if (scannedData.confidence === 'low' || scannedData.brand === 'Scan Mislukt') {
     throw new Error("Geen tekst gevonden. Probeer handmatig te zoeken.");
  }

  // 2. Parallel fetch for Enrichment (Producer info + Vivino + Vat39 + Production)
  const [producer, vivino, vat39Rec, production] = await Promise.all([
    findProducerInfo(scannedData),
    findVivinoData(scannedData),
    findVat39Recommendation(scannedData),
    findProductionMethod(scannedData)
  ]);

  // 3. Convert image to Base64 for persistent local storage
  const base64Image = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(imageFile);
  });

  // 4. Construct Product object
  return {
    id: crypto.randomUUID(),
    name: `${scannedData.brand} ${scannedData.productName}`,
    brand: scannedData.brand || 'Unknown',
    category: scannedData.category || 'Unknown',
    abv: scannedData.abv,
    volume: scannedData.volume,
    vintage: scannedData.vintage,
    image: base64Image, // Persistent Data URL
    producer,
    vivino,
    vat39Recommendation: vat39Rec,
    productionMethod: production,
    scannedAt: new Date()
  };
}
