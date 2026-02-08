'use client';

import { useFavorites } from '@/hooks/useFavorites';
import Link from 'next/link';
import { ChevronRight, Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold text-text">Favorieten</h1>
        <span className="bg-brand-soft text-brand text-xs font-bold px-2 py-1 rounded-full">
            {favorites.length}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-4 bg-surface rounded-full shadow-sm">
                <Heart className="w-8 h-8 text-muted" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-text">Nog geen favorieten</h3>
                <p className="text-sm text-muted">Scan producten en voeg ze toe aan je lijst.</p>
            </div>
            <Link href="/scan" className="text-brand font-medium text-sm">
                Start met scannen
            </Link>
        </div>
      ) : (
        <div className="grid gap-4">
            {favorites.map((product) => (
                <Link 
                    key={product.id} 
                    href={`/product/${product.id}`}
                    className="flex items-center p-3 bg-white rounded-[16px] border border-divider shadow-sm active:scale-[0.99] transition-transform"
                >
                    <div className="w-16 h-20 bg-surface2 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {product.image && product.image.startsWith('blob:') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] text-muted">Fles</span>
                        )}
                    </div>
                    <div className="flex-1 ml-4 min-w-0">
                        <div className="text-[10px] font-bold text-brand uppercase tracking-wider truncate">
                            {product.category}
                        </div>
                        <h3 className="font-semibold text-text truncate">{product.name}</h3>
                        <div className="flex items-center text-xs text-muted mt-1 space-x-2">
                            <span>{product.brand}</span>
                            {product.vivino && (
                                <span className="flex items-center text-text font-medium">
                                    <span className="text-yellow-500 mr-1">★</span> {product.vivino.score}
                                </span>
                            )}
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted ml-2" />
                </Link>
            ))}
        </div>
      )}
    </div>
  );
}
