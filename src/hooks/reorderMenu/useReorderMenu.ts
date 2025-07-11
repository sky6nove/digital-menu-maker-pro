
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "../useProducts";
import { useCategories } from "../useCategories";
import { useComplementGroups } from "../useComplementGroups";
import { useProductComplementGroups } from "../useProductComplementGroups";
import { useGroupComplements } from "../useGroupComplements";
import { useReorderCategories } from "./useReorderCategories";
import { useReorderProducts } from "./useReorderProducts";
import { useReorderGroups } from "./useReorderGroups";
import { useReorderComplements } from "./useReorderComplements";

export const useReorderMenu = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { products, loadProducts } = useProducts(user?.id);
  const { categories, loadCategories } = useCategories(user?.id);
  const { loadComplementGroups } = useComplementGroups();
  const { fetchComplementGroupsByProduct } = useProductComplementGroups();
  const { fetchComplementsByGroup } = useGroupComplements();
  
  // Memoize load functions to prevent infinite loops
  const memoizedLoadCategories = useCallback(() => loadCategories(), [loadCategories]);
  const memoizedLoadProducts = useCallback(() => loadProducts(), [loadProducts]);
  const memoizedFetchComplementGroupsByProduct = useCallback(
    (productId: number) => fetchComplementGroupsByProduct(productId),
    [fetchComplementGroupsByProduct]
  );
  const memoizedFetchComplementsByGroup = useCallback(
    (groupId: number) => fetchComplementsByGroup(groupId),
    [fetchComplementsByGroup]
  );
  
  const { 
    activeCategory, 
    saving: savingCategories,
    handleCategoryMove, 
    handleCategorySelect
  } = useReorderCategories(categories, memoizedLoadCategories);
  
  const { 
    filteredProducts, 
    activeProduct, 
    saving: savingProducts,
    handleProductMove, 
    handleProductSelect 
  } = useReorderProducts(products, activeCategory, async () => { loadProducts(); });
  
  const { 
    productGroups, 
    activeGroup, 
    loading: loadingGroups,
    saving: savingGroups,
    handleGroupMove, 
    handleGroupSelect 
  } = useReorderGroups(activeProduct, memoizedFetchComplementGroupsByProduct);
  
  const { 
    groupComplements, 
    loadingComplements,
    saving: savingComplements, 
    handleComplementMove 
  } = useReorderComplements(activeGroup, memoizedFetchComplementsByGroup);

  const loadAllData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        memoizedLoadCategories(),
        memoizedLoadProducts(),
        loadComplementGroups()
      ]);
    } catch (error) {
      toast.error("Erro ao carregar dados");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, memoizedLoadCategories, memoizedLoadProducts, loadComplementGroups]);

  useEffect(() => {
    loadAllData();
  }, [user?.id]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Ordem salva com sucesso");
      return true;
    } catch (error) {
      toast.error("Erro ao salvar alterações");
      console.error("Error saving menu order:", error);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const activeCategoryName = activeCategory 
    ? categories.find(c => c.id === activeCategory)?.name || ''
    : '';

  const activeProductName = activeProduct
    ? products.find(p => p.id === activeProduct)?.name || ''
    : '';

  const activeGroupName = activeGroup 
    ? productGroups.find(g => g.id === activeGroup)?.name || ''
    : '';

  return {
    loading,
    saving,
    categories,
    filteredProducts,
    productGroups,
    groupComplements,
    activeCategory,
    activeProduct,
    activeGroup,
    loadingProducts: false,
    loadingGroups,
    loadingComplements,
    savingCategories,
    savingProducts,
    savingGroups,
    savingComplements,
    activeCategoryName,
    activeProductName,
    activeGroupName,
    handleCategoryMove,
    handleProductMove,
    handleGroupMove,
    handleComplementMove,
    handleCategorySelect,
    handleProductSelect,
    handleGroupSelect,
    handleSave
  };
};
