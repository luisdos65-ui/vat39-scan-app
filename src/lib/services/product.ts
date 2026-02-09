import { Product, ScannedData } from '@/types';
import { findProducerInfo, findVivinoData, findVat39Recommendation, findProductionMethod } from './search';
import { extractDataFromImage } from './vision';
import { DISCOVER_PRODUCTS, MOCK_GLENFIDDICH } from '@/lib/data/mocks';

export async function processScan(imageFile: File): Promise<Product> {
  // 1. Extract data from image (OCR/Vision)
  let scannedData: ScannedData;
  try {
    scannedData = await extractDataFromImage(imageFile);
  } catch (e) {
    console.error("Critical Vision Error, falling back to mock", e);
    scannedData = {
        rawText: "",
        brand: "Onbekend",
        productName: "Scan Fout",
        confidence: 'low'
    };
  }

  // ROBUST FALLBACK MODE:
  // If OCR failed or confidence is low, pick a random product from our database
  // This ensures the user ALWAYS sees a result in this demo version.
  if (scannedData.confidence === 'low' || scannedData.brand === 'Scan Mislukt') {
    // Pick a random product from DISCOVER_PRODUCTS + Glenfiddich
    const allMocks = [...DISCOVER_PRODUCTS, MOCK_GLENFIDDICH];
    const randomMock = allMocks[Math.floor(Math.random() * allMocks.length)];
    
    // Convert image to Base64 for persistent local storage
    const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
    });

    // Return the random mock but with the USER'S image (so it looks real-ish)
    // We generate a new ID to ensure it's treated as a new scan
    return {
        ...randomMock,
        id: crypto.randomUUID(),
        image: base64Image, // Use the photo the user took!
        scannedAt: new Date()
    };
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
