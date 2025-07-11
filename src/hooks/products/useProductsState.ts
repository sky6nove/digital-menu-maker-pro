import { useState } from "react";
import { Product } from "@/types";

export const useProductsState = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(undefined);

  return {
    products,
    setProducts,
    loading,
    setLoading,
    currentProduct,
    setCurrentProduct
  };
};