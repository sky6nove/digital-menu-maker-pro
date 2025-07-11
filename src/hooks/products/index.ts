import { Product, ProductSize } from "@/types";
import { useProductsState } from "./useProductsState";
import { useProductOperations } from "./useProductOperations";

export const useProducts = (userId?: string) => {
  const {
    products,
    setProducts,
    loading,
    setLoading,
    currentProduct,
    setCurrentProduct
  } = useProductsState();

  const { loadProducts, handleDeleteProduct, handleSubmitProduct } = useProductOperations();

  const loadProductsWithState = () => {
    loadProducts(userId, setProducts, setLoading);
  };

  const deleteProductWithReload = (id: number) => {
    handleDeleteProduct(id, userId, loadProductsWithState);
  };

  const submitProductWithReload = async (productData: Omit<Product, "id"> | Product, sizes?: ProductSize[]): Promise<Product | undefined> => {
    const result = await handleSubmitProduct(productData, sizes, userId, loadProductsWithState);
    return result;
  };

  return {
    products,
    loading,
    currentProduct,
    loadProducts: loadProductsWithState,
    handleDeleteProduct: deleteProductWithReload,
    handleSubmitProduct: submitProductWithReload,
    setCurrentProduct
  };
};

export * from "./useProductsState";
export * from "./useProductOperations";
export * from "./productTransformers";