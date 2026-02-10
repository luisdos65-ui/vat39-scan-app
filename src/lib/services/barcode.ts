import { Product } from '@/types';

const OFF_API_URL = 'https://world.openfoodfacts.org/api/v2/product/';

export async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    console.log(`Fetching product for barcode: ${barcode}`);
    const response = await fetch(`${OFF_API_URL}${barcode}.json`);
    
    // If not found in OpenFoodFacts, return a placeholder product
    // so the user can manually edit/verify instead of getting stuck
    if (!response.ok || response.status === 404) {
        console.log("Product not found in OpenFoodFacts, returning placeholder");
        return createFallbackProduct(barcode);
    }

    const data = await response.json();
    
    if (data.status === 0 || !data.product) {
        return createFallbackProduct(barcode);
    }

    const p = data.product;
    
    // Map OFF data to our Product type
    const product: Product = {
        id: crypto.randomUUID(),
        name: p.product_name || p.product_name_en || p.product_name_nl || `Barcode: ${barcode}`,
        brand: p.brands || 'Onbekend Merk',
        category: p.categories_tags?.[0]?.replace('en:', '') || 'Wijn / Gedistilleerd',
        image: p.image_url || p.image_front_url || "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&q=80&w=1000",
        abv: p.nutriments?.alcohol ? `${p.nutriments.alcohol}%` : undefined,
        volume: p.quantity,
        vintage: undefined,
        producer: {
            name: p.brands || 'Onbekend',
            region: p.origins || undefined,
            country: p.countries || undefined,
        },
        scannedAt: new Date(),
        scanMethod: 'BARCODE',
        verificationStatus: 'VERIFIED',
        vivino: undefined,
        vat39Recommendation: undefined,
        productionMethod: undefined,
        citations: []
    };

    return product;

  } catch (error) {
    console.error("Barcode lookup failed:", error);
    return createFallbackProduct(barcode);
  }
}

function createFallbackProduct(barcode: string): Product {
    return {
        id: crypto.randomUUID(),
        name: `Barcode: ${barcode}`,
        brand: "Niet gevonden",
        category: "Wijn / Gedistilleerd",
        image: "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&q=80&w=1000",
        producer: {
            name: "Onbekend",
        },
        scannedAt: new Date(),
        scanMethod: 'BARCODE',
        verificationStatus: 'UNKNOWN',
        vivino: undefined,
        vat39Recommendation: undefined,
        productionMethod: undefined,
        citations: []
    };
}
