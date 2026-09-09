import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, ProductImage, UserManualData, Review, SiteSettings } from '../types.ts';
import { api } from '../services/api.ts';

interface StoreContextType {
  product: Product | null;
  images: ProductImage[];
  manual: UserManualData | null;
  reviews: Review[];
  settings: SiteSettings | null;
  isLoading: boolean;
  refreshProduct: () => Promise<void>;
  refreshImages: () => Promise<void>;
  refreshManual: () => Promise<void>;
  refreshReviews: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [manual, setManual] = useState<UserManualData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProduct = useCallback(async () => {
    try {
      const res = await api.getProduct();
      setProduct(res.product);
      if (res.product.images) {
        setImages(res.product.images);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    }
  }, []);

  const refreshImages = useCallback(async () => {
    try {
      const res = await api.getImages();
      setImages(res.images);
    } catch (err) {
      console.error('Error fetching images:', err);
    }
  }, []);

  const refreshManual = useCallback(async () => {
    try {
      const res = await api.getManual();
      setManual(res.manual);
    } catch (err) {
      console.error('Error fetching manual:', err);
    }
  }, []);

  const refreshReviews = useCallback(async () => {
    try {
      const res = await api.getReviews();
      setReviews(res.reviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await api.getSettings();
      setSettings(res.settings);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      refreshProduct(),
      refreshImages(),
      refreshManual(),
      refreshReviews(),
      refreshSettings(),
    ]);
    setIsLoading(false);
  }, [refreshProduct, refreshImages, refreshManual, refreshReviews, refreshSettings]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <StoreContext.Provider
      value={{
        product,
        images,
        manual,
        reviews,
        settings,
        isLoading,
        refreshProduct,
        refreshImages,
        refreshManual,
        refreshReviews,
        refreshSettings,
        refreshAll,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
}
