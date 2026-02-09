export interface Citation {
  url: string;
  quote: string;
}

export interface ScannedData {
  rawText: string;
  brand?: string;
  productName?: string;
  category?: string;
  abv?: string;
  volume?: string;
  vintage?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface Producer {
  name: string;
  type?: string;
  website?: string;
  country?: string;
  region?: string;
  about?: string; // Was description
  description?: string; // Backward compatibility
  citations?: Citation[];
  logo?: string;
}

export interface VivinoReview {
  rating: number;
  text: string;
  user: string;
  date: string;
}

export interface VivinoData {
  score: number;
  reviews: number; // ratings_count
  highlights?: string[]; // Kept for UI compatibility
  top_reviews?: VivinoReview[];
  url?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  abv?: string;
  volume?: string;
  vintage?: string; // age_or_vintage
  maturation?: string;
  
  image?: string;
  
  producer?: Producer;
  vivino?: VivinoData;
  
  vat39Recommendation?: string; // Why Vat39 offers this
  productionMethod?: string;    // how_made
  tastingNotes?: string[];
  
  citations?: Citation[];
  productUrl?: string;
  verificationStatus?: 'VERIFIED' | 'PARTIAL' | 'UNKNOWN';
  scanMethod?: 'google-ai' | 'tesseract-ocr';
  
  userScore?: number;
  userReview?: string;
  scannedAt: Date;
}
