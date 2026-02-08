'use client';

import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { DISCOVER_PRODUCTS } from '@/lib/data/mocks';

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState('Alles');
  const categories = ['Alles', 'Whisky', 'Rum', 'Wijn', 'Gin', 'Cognac'];

  // Mock Discovery Data
  const products = DISCOVER_PRODUCTS;

  const filteredProducts = activeCategory === 'Alles' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text">Ontdek</h1>
        
        {/* Search Bar */}
        <div className="relative">
            <input 
                type="text" 
                placeholder="Zoek op naam, merk of type..." 
                className="w-full h-12 pl-11 pr-4 bg-white border border-divider rounded-[16px] text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-surface2 rounded-lg text-muted hover:text-text">
                <SlidersHorizontal className="w-4 h-4" />
            </button>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        activeCategory === cat 
                        ? 'bg-brand text-white shadow-md shadow-brand/20' 
                        : 'bg-white text-muted border border-divider hover:bg-surface2'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text">Populair</h2>
            <Link href="#" className="text-xs text-brand font-medium">Bekijk alles</Link>
        </div>
        
        <div className="grid gap-3">
            {filteredProducts.map((product) => (
                <Link 
                    key={product.id} 
                    href={`/product/${product.id}`}
                    className="flex items-center p-3 bg-white rounded-[16px] border border-divider shadow-sm active:scale-[0.99] transition-transform"
                >
                    <div className="w-16 h-20 bg-surface2 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {product.image ? (
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
                        <div className="text-xs text-muted mt-0.5">{product.brand}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted ml-2" />
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
