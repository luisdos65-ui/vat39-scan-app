import { useState, useEffect } from 'react';
import { Product } from '@/types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const toggleFavorite = (product: Product) => {
    const isFavorite = favorites.some(p => p.id === product.id);
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter(p => p.id !== product.id);
    } else {
      newFavorites = [...favorites, product];
    }

    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    return !isFavorite;
  };

  const isFavorite = (productId: string) => {
    return favorites.some(p => p.id === productId);
  };

  return { favorites, toggleFavorite, isFavorite };
}
