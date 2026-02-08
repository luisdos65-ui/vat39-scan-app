import { Product, ScannedData } from '@/types';
import { findProducerInfo, findVivinoData } from './search';
import { extractDataFromImage } from './vision';

export async function processScan(imageFile: File): Promise<Product> {
  // 1. Extract data from image (OCR/Vision)
  const scannedData = await extractDataFromImage(imageFile);

  // 2. Parallel fetch for Enrichment (Producer info + Vivino)
  const [producer, vivino] = await Promise.all([
    findProducerInfo(scannedData),
    findVivinoData(scannedData)
  ]);

  // 3. Construct Product object
  return {
    id: crypto.randomUUID(),
    name: `${scannedData.brand} ${scannedData.productName}`,
    brand: scannedData.brand || 'Unknown',
    category: scannedData.category || 'Unknown',
    abv: scannedData.abv,
    volume: scannedData.volume,
    vintage: scannedData.vintage,
    image: URL.createObjectURL(imageFile), // Temporary blob URL for display
    producer,
    vivino,
    scannedAt: new Date()
  };
}
