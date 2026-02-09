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
  // We removed the random mock fallback. Now we trust the OCR result even if it's imperfect.
  // This allows the user to see what was actually scanned.
  
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
