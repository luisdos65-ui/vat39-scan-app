import { Product } from '@/types';

const OFF_API_URL = 'https://world.openfoodfacts.org/api/v2/product/';

export async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    console.log(`Fetching product for barcode: ${barcode}`);
    const response = await fetch(`${OFF_API_URL}${barcode}.json`);
    
    if (!response.ok) {
        if (response.status === 404) {
            console.log("Product not found in OpenFoodFacts");
            return null;
        }
        throw new Error(`OpenFoodFacts API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 0 || !data.product) {
        return null;
    }

    const p = data.product;
    
    // Map OFF data to our Product type
    const product: Product = {
        id: crypto.randomUUID(),
        name: p.product_name || p.product_name_en || p.product_name_nl || 'Onbekend Product',
        brand: p.brands || 'Onbekend Merk',
        category: p.categories_tags?.[0]?.replace('en:', '') || 'Wijn / Gedistilleerd',
        image: p.image_url || p.image_front_url,
        abv: p.nutriments?.alcohol ? `${p.nutriments.alcohol}%` : undefined,
        volume: p.quantity,
        vintage: undefined, // OFF rarely has vintage for wine
        producer: {
            name: p.brands || 'Onbekend',
            region: p.origins || undefined,
            country: p.countries || undefined,
        },
        scannedAt: new Date(),
        scanMethod: 'BARCODE',
        verificationStatus: 'VERIFIED', // It's a real product from a database
        vivino: undefined, // We could try to search Vivino by name later
        vat39Recommendation: undefined,
        productionMethod: undefined,
        citations: []
    };

    return product;

  } catch (error) {
    console.error("Barcode lookup failed:", error);
    return null;
  }
}
