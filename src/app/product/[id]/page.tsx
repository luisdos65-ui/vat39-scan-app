'use client';

import { Star, Globe, MapPin, ChevronLeft, Share2, ExternalLink, Heart } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';
import { clsx } from 'clsx';
import { MOCK_GLENFIDDICH, DISCOVER_PRODUCTS } from '@/lib/data/mocks';

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    // 1. Try to find product in recent scans (simulating DB fetch)
    const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
    const foundInScans = recentScans.find((p: Product) => p.id === id);

    if (foundInScans) {
      setProduct(foundInScans);
      return;
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
    
    // 4. If absolutely nothing found
    // Stop loading, show "Not Found" state (handled by !product check)
    // We do NOT default to Glenfiddich anymore
  }, [id]);

  if (!product) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-6">
              <div className="text-xl font-bold text-text">Product niet gevonden</div>
              <p className="text-muted">We konden de gescande gegevens niet ophalen. Probeer opnieuw te scannen.</p>
              <button 
                onClick={() => router.push('/scan')}
                className="px-6 py-3 bg-brand text-white rounded-full font-medium"
              >
                Opnieuw Scannen
              </button>
          </div>
      );
  }

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
            className="w-32 h-48 bg-white rounded-lg shadow-md flex items-center justify-center p-2 relative overflow-hidden"
        >
             {/* Image Placeholder */}
             {product.image && product.image.startsWith('blob:') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
             ) : (
                <div className="w-full h-full bg-surface2 rounded flex items-center justify-center text-xs text-muted">
                    Fles Foto
                </div>
             )}
        </motion.div>
        <div className="space-y-1">
            <div className="text-xs font-semibold text-brand tracking-wider uppercase">{product.category}</div>
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

      {/* Vivino Card */}
      {product.vivino && (
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[16px] p-5 shadow-sm border border-divider relative"
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-text flex items-center gap-2">
                    Vivino Score
                </h3>
                {product.vivino.score > 0 ? (
                    <div className="bg-[#B11831] text-white text-xs font-bold px-2 py-1 rounded">
                        {product.vivino.score}
                    </div>
                ) : (
                    <div className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">
                        ?
                    </div>
                )}
            </div>
            
            {product.vivino.score > 0 ? (
                <div className="flex items-center space-x-1 mb-2">
                    {[1, 2, 3, 4].map(i => <Star key={i} className="w-4 h-4 fill-[#B11831] text-[#B11831]" />)}
                    <Star className="w-4 h-4 text-[#B11831]" />
                    <span className="text-xs text-muted ml-1">({product.vivino.reviews} reviews)</span>
                </div>
            ) : (
                <div className="mb-2 text-sm text-muted">
                    Geen directe score gevonden.
                </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3 mb-4">
                {product.vivino.highlights.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-surface2 text-xs rounded-full text-muted border border-divider">
                        {tag}
                    </span>
                ))}
            </div>

            {product.vivino.url && (
                 <Link 
                    href={product.vivino.url} 
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 bg-[#B11831] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#901328] transition-colors"
                >
                    Zoek op Vivino <ExternalLink className="w-4 h-4" />
                </Link>
            )}
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
            </div>
        </motion.div>
      )}

      {/* Reviews / Action */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-brand-soft rounded-[16px] p-5 border border-brand/10 text-center space-y-3"
      >
        <h3 className="font-semibold text-brand-2">Wat vind jij?</h3>
        <p className="text-sm text-muted">Heb je dit product geproefd? Deel je mening.</p>
        <button className="w-full bg-white text-brand font-medium h-10 rounded-[14px] border border-brand/20 shadow-sm active:scale-[0.98] transition-all">
            Schrijf een review
        </button>
      </motion.div>
    </div>
  );
}
