import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { Categoria, CategoriesResponse } from '../types/product';

export const useCategories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Categoria[]>([]);

  const getCategories = async () => {
    try {
      const data = await apiService.get<CategoriesResponse>('/categorias');
      setCategories(data.categorias);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading categories:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return { isLoading, categories };
};
