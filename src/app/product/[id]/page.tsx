'use client';

// Force dynamic rendering to avoid static generation of this route
export const dynamic = 'force-dynamic';

import { Star, Globe, MapPin, ChevronLeft, Share2, ExternalLink, Heart, Award, FlaskConical, Quote, CheckCircle2, AlertCircle, HelpCircle, BookOpen } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image'; // Use Next.js Image component
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';
import { clsx } from 'clsx';
import { MOCK_GLENFIDDICH, DISCOVER_PRODUCTS } from '@/lib/data/mocks';

const getScanMethodBadge = (method?: string) => {
  if (!method) return null;
  return (
    <div className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold border border-gray-200 uppercase">
      {method}
    </div>
  );
};

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Add a mounted check to avoid hydration mismatch and ensure we are on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 1. Try to find product in recent scans (simulating DB fetch)
    try {
        // First check session storage for immediate handover
        const sessionStored = sessionStorage.getItem('currentProduct');
        if (sessionStored) {
            const p = JSON.parse(sessionStored);
            if (p.id === id) {
                setProduct(p);
                return;
            }
        }

        const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
        const foundInScans = recentScans.find((p: Product) => p.id === id);
        if (foundInScans) {
            setProduct(foundInScans);
            return;
        }
    } catch (e) {
        console.error("Error reading from local storage", e);
    }
    
    // 2. Try to find in Discover Mocks
    const foundInDiscover = DISCOVER_PRODUCTS.find(p => p.id === id);
    if (foundInDiscover) {
        setProduct(foundInDiscover);
        return;
    }

    // 3. Fallback to Glenfiddich Mock if it's the specific mock ID
    if (id === MOCK_GLENFIDDICH.id) {
        setProduct(MOCK_GLENFIDDICH);
        return;
    }
  }, [id, mounted]);

  // Show loading state until mounted and product search is done
  if (!mounted) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;

  if (!product) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-6">
              <div className="text-xl font-bold text-text">Product niet gevonden</div>
              <p className="text-muted">We konden de gescande gegevens niet ophalen. Dit kan gebeuren als de foto te groot was of de sessie is verlopen.</p>
              <button 
                onClick={() => router.push('/scan')}
                className="px-6 py-3 bg-brand text-white rounded-full font-medium shadow-lg shadow-brand/20"
              >
                Opnieuw Scannen
              </button>
          </div>
      );
  }

  // Helper for verification badge
  const getVerificationBadge = (status?: string) => {
    switch (status) {
        case 'VERIFIED':
            return (
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold border border-green-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>VERIFIED</span>
                </div>
            );
        case 'PARTIAL':
            return (
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold border border-amber-200">
                    <AlertCircle className="w-3 h-3" />
                    <span>PARTIAL</span>
                </div>
            );
        default:
            return (
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold border border-gray-200">
                    <HelpCircle className="w-3 h-3" />
                    <span>UNVERIFIED</span>
                </div>
            );
    }
  };

  return (
    <div className="pb-8 space-y-6">
      {/* Header / Nav */}
      <div className="flex items-center justify-between py-2">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-muted hover:text-text">
            <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center">
            <button 
                className="p-2 text-muted hover:text-text"
                onClick={() => toggleFavorite(product)}
            >
                <Heart className={clsx("w-6 h-6 transition-colors", isFavorite(product.id) ? "fill-brand text-brand" : "text-muted")} />
            </button>
            <button className="p-2 -mr-2 text-muted hover:text-text">
                <Share2 className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Product Header */}
      <div className="flex flex-col items-center space-y-4 text-center">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-48 bg-white rounded-lg shadow-md flex items-center justify-center p-2 relative overflow-hidden group"
        >
             {/* Image Placeholder */}
             {product.image && (product.image.startsWith('data:') || product.image.startsWith('http')) ? (
                <div className="relative w-full h-full">
                    <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill
                        className="object-cover rounded"
                        unoptimized={true} 
                    />
                </div>
             ) : (
                <div className="w-full h-full bg-surface2 rounded flex items-center justify-center text-xs text-muted">
                    Fles Foto
                </div>
             )}
             
             {/* Status Badge Overlay */}
             <div className="absolute top-2 right-2">
                 {getVerificationBadge(product.verificationStatus)}
             </div>
        </motion.div>
        
        <div className="space-y-1">
            <div className="flex items-center justify-center space-x-2">
                <div className="text-xs font-semibold text-brand tracking-wider uppercase">{product.category}</div>
                {getScanMethodBadge(product.scanMethod)}
            </div>
            <h1 className="text-2xl font-bold text-text">{product.name}</h1>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted">
                <span>{product.abv}</span>
                <span>•</span>
                <span>{product.volume}</span>
                {product.vintage && (
                    <>
                        <span>•</span>
                        <span>{product.vintage} YO</span>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* Score Card - Vat39 Score (User) or Vivino Score */}
      {(product.userScore || product.vivino) && (
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[16px] p-5 shadow-sm border border-divider relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Star className="w-16 h-16" />
            </div>
            
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                    {product.userScore ? (
                        <>
                            <h3 className="font-semibold text-brand">Vat39 Score</h3>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <span className="text-3xl font-bold text-brand">{product.userScore}</span>
                                <span className="text-sm text-muted">/ 5.0</span>
                            </div>
                            <div className="text-xs text-muted mt-1">Gebaseerd op jouw beoordeling</div>
                        </>
                    ) : (
                        <>
                            <h3 className="font-semibold text-text">Vivino Score</h3>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <span className="text-3xl font-bold text-brand">{product.vivino?.score}</span>
                                <span className="text-sm text-muted">/ 5.0</span>
                            </div>
                            <div className="text-xs text-muted mt-1">{product.vivino?.reviews} beoordelingen</div>
                        </>
                    )}
                </div>
                {product.vivino?.url && !product.userScore && (
                    <Link href={product.vivino.url} target="_blank" className="text-brand text-xs font-medium flex items-center bg-brand-soft px-2 py-1 rounded-full">
                        Bekijk op Vivino <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                )}
            </div>

            {/* Show Top Reviews if available (and not overridden by user review UI below) */}
            {product.vivino?.top_reviews && product.vivino.top_reviews.length > 0 && !product.userScore && (
                <div className="space-y-3 pt-3 border-t border-divider border-dashed relative z-10">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Top Reviews</h4>
                    {product.vivino.top_reviews.map((review, idx) => (
                        <div key={idx} className="bg-surface2 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-xs text-text">{review.user}</span>
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={clsx("w-3 h-3", i < review.rating ? "fill-current" : "text-gray-300")} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-text/80 italic">"{review.text}"</p>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
      )}

      {/* Production Method Card */}
      {product.productionMethod && (
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-[16px] p-5 shadow-sm border border-divider space-y-3"
        >
            <h3 className="font-semibold text-text flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-brand" />
                Hoe het gemaakt wordt
            </h3>
            <p className="text-sm text-muted leading-relaxed">
                {product.productionMethod}
            </p>
        </motion.div>
      )}

      {/* Vat39 Expert Card */}
      {product.vat39Recommendation && (
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-brand/5 to-transparent rounded-[16px] p-5 shadow-sm border border-brand/10 space-y-3"
        >
            <h3 className="font-semibold text-brand flex items-center gap-2">
                <Award className="w-5 h-5" />
                Vat39 De Specialist
            </h3>
            <div className="flex gap-3">
                <Quote className="w-8 h-8 text-brand/20 shrink-0 transform rotate-180" />
                <p className="text-sm text-text italic leading-relaxed">
                    {product.vat39Recommendation}
                </p>
            </div>
        </motion.div>
      )}

      {/* Producer Card */}
      {product.producer && (
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[16px] p-5 shadow-sm border border-divider space-y-3"
        >
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text">Producent</h3>
                {product.producer.website && (
                    <Link href={product.producer.website} target="_blank" className="text-brand text-xs font-medium flex items-center">
                        Website <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                )}
            </div>
            <div className="space-y-2">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-brand-soft rounded-full shrink-0">
                        <Globe className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                        <div className="font-medium text-sm">{product.producer.name}</div>
                        {product.producer.region && (
                            <div className="text-xs text-muted flex items-center mt-0.5">
                                <MapPin className="w-3 h-3 mr-1" /> {product.producer.region}
                            </div>
                        )}
                    </div>
                </div>
                {product.producer.description && (
                    <p className="text-sm text-muted leading-relaxed pt-2 border-t border-divider border-dashed">
                        {product.producer.description}
                    </p>
                )}
                
                {/* Citations / Sources */}
                {product.citations && product.citations.length > 0 && (
                    <div className="mt-3 pt-2">
                        <div className="text-[10px] uppercase text-muted font-semibold mb-2 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Bronnen
                        </div>
                        <div className="space-y-2">
                            {product.citations.map((cite, idx) => {
                                let hostname = "Bron";
                                try {
                                    hostname = new URL(cite.url).hostname;
                                } catch (e) {
                                    // Fallback if URL is invalid
                                }
                                return (
                                    <Link key={idx} href={cite.url} target="_blank" className="block bg-surface2/50 p-2 rounded hover:bg-surface2 transition-colors">
                                        <p className="text-[10px] text-text/80 italic line-clamp-2">"{cite.quote}"</p>
                                        <div className="text-[9px] text-brand mt-1 truncate">{hostname}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
      )}

      {/* Reviews / Action */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-brand-soft rounded-[16px] p-5 border border-brand/10 space-y-3"
      >
        <div className="text-center space-y-2">
            <h3 className="font-semibold text-brand-2">Wat vind jij?</h3>
            <p className="text-sm text-muted">Heb je dit product geproefd? Deel je mening.</p>
        </div>

        {!product.userReview ? (
             <button 
                onClick={() => {
                    const review = prompt("Schrijf je review:");
                    const rating = prompt("Geef een score (1-5):");
                    if (review && rating) {
                        const updatedProduct = { 
                            ...product, 
                            userReview: review, 
                            userScore: parseInt(rating) 
                        };
                        setProduct(updatedProduct);
                        // Update in local storage
                        const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
                        const updatedScans = recentScans.map((p: Product) => p.id === product.id ? updatedProduct : p);
                        localStorage.setItem('recentScans', JSON.stringify(updatedScans));
                    }
                }}
                className="w-full bg-white text-brand font-medium h-10 rounded-[14px] border border-brand/20 shadow-sm active:scale-[0.98] transition-all"
             >
                Schrijf een review
             </button>
        ) : (
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm text-text">Jouw Review</span>
                    <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={clsx("w-3 h-3", i < (product.userScore || 0) ? "fill-current" : "text-gray-300")} />
                        ))}
                    </div>
                </div>
                <p className="text-sm text-text/80 italic">"{product.userReview}"</p>
            </div>
        )}
      </motion.div>
    </div>
  );
}
