import { Product, ScannedData } from '@/types';
import { findProducerInfo, findVat39Recommendation, findProductionMethod } from './search';
import { extractDataFromImage } from './vision';
import { DISCOVER_PRODUCTS, MOCK_GLENFIDDICH } from '@/lib/data/mocks';
import { compressImage } from '@/lib/utils';

// Helper to simulate Base44's verification logic
function determineVerificationStatus(scanned: ScannedData, producer: any): 'VERIFIED' | 'PARTIAL' | 'UNKNOWN' {
    if (scanned.brand?.toLowerCase().includes('glenfiddich') && producer.website) return 'VERIFIED';
    if (producer.website && producer.website.includes('google')) return 'UNKNOWN';
    if (producer.name) return 'PARTIAL';
    return 'UNKNOWN';
}

export async function processTextSearch(query: string): Promise<Product> {
  const scannedData: ScannedData = {
      rawText: query,
      brand: query,
      productName: "",
      confidence: 'high'
  };

  // Parallel fetch for Enrichment
  const [producer, vat39Rec, production] = await Promise.all([
    findProducerInfo(scannedData),
    findVat39Recommendation(scannedData),
    findProductionMethod(scannedData)
  ]);

  const verificationStatus = determineVerificationStatus(scannedData, producer);

  return {
    id: crypto.randomUUID(),
    name: query,
    brand: query,
    category: "Gezocht Product",
    image: "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&q=80&w=1000", // Generic search image
    producer,
    vat39Recommendation: vat39Rec,
    productionMethod: production,
    verificationStatus,
    citations: producer.citations || [],
    scannedAt: new Date()
  };
}

export async function processScan(imageFile: File): Promise<Product> {
  // 1. Extract data from image (OCR/Vision)
  // Corresponds to Base44 Step 1: OCR
  let scannedData: ScannedData;
  try {
    scannedData = await extractDataFromImage(imageFile);
  } catch (e) {
    console.error("Critical Vision Error", e);
    throw new Error("Scan mislukt. Probeer het opnieuw of zoek handmatig.");
  }

  // ROBUST FALLBACK MODE REMOVED per user request ("neen hij geeft de opgeslagen van het bestand")
  // However, we must allow partial results to proceed to search instead of hard failing.
  // The search service will handle "Onbekend" or poor OCR results by offering a Google search.
  if (scannedData.brand === 'Scan Mislukt' && scannedData.rawText === 'Error reading text') {
     throw new Error("Geen tekst gevonden. Probeer handmatig te zoeken.");
  }

  // Parallel fetch for Enrichment (Producer info + Vat39 + Production)
  // Corresponds to Base44 Steps 2 (Search), 3 (Parse), 4 (Verify)
  // We execute them in parallel for speed, but logically they map to the requested flow.
  const [producer, vat39Rec, production] = await Promise.all([
    findProducerInfo(scannedData),
    findVat39Recommendation(scannedData),
    findProductionMethod(scannedData)
  ]);

  // 3. Compress image for persistent local storage (max 500px, 60% quality)
  // This is CRITICAL to avoid LocalStorage quota limits (5MB)
  let base64Image = "";
  try {
      base64Image = await compressImage(imageFile, 500, 0.6);
  } catch (imgError) {
      console.warn("Image compression failed, using placeholder", imgError);
      base64Image = "https://images.unsplash.com/photo-1556676114-151b22814c82?auto=format&fit=crop&q=80&w=500";
  }

  const verificationStatus = determineVerificationStatus(scannedData, producer);

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
    vat39Recommendation: vat39Rec,
    productionMethod: production,
    verificationStatus,
    citations: producer.citations || [],
    scannedAt: new Date()
  };
}
