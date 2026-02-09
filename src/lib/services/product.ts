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
    scannedAt: new Date()
  };
}
