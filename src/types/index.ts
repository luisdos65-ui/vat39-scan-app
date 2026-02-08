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
  website?: string;
  region?: string;
  description?: string;
  logo?: string;
}

export interface VivinoData {
  score: number;
  reviews: number;
  highlights: string[];
  url?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  abv?: string;
  volume?: string;
  vintage?: string;
  image?: string;
  producer?: Producer;
  vivino?: VivinoData;
  userScore?: number;
  userReview?: string;
  scannedAt: Date;
}
