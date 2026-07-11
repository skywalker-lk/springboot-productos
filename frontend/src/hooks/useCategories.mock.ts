import { useEffect, useState } from 'react';
import type { Categoria } from '../types/product';

// MOCK de categorías para probar sin backend
const MOCK_CATEGORIES: Categoria[] = [
  { id: 1, _id: 'cat1', nombre: 'Electrónica' },
  { id: 2, _id: 'cat2', nombre: 'Hogar' },
  { id: 3, _id: 'cat3', nombre: 'Deportes' },
  { id: 4, _id: 'cat4', nombre: 'Libros' },
];

export const useCategories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Categoria[]>([]);

  useEffect(() => {
    // Simular delay de red
    setTimeout(() => {
      setCategories(MOCK_CATEGORIES);
      setIsLoading(false);
    }, 300);
  }, []);

  return { isLoading, categories };
};
