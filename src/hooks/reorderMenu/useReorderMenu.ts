
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
  
  // Import hooks
  const { products, loadProducts } = useProducts(user?.id);
  const { categories, loadCategories } = useCategories(user?.id);
  const { loadComplementGroups } = useComplementGroups();
  const { fetchComplementGroupsByProduct } = useProductComplementGroups();
  const { fetchComplementsByGroup } = useGroupComplements();
  
  // Init specialized hooks
  const { 
    activeCategory, 
    saving: savingCategories,
    handleCategoryMove, 
    handleCategorySelect
  } = useReorderCategories(categories, loadCategories);
  
  const { 
    filteredProducts, 
    activeProduct, 
    loading: loadingProducts,
    saving: savingProducts,
    handleProductMove, 
    handleProductSelect 
  } = useReorderProducts(products, activeCategory, loadProducts);
  
  const { 
    productGroups, 
    activeGroup, 
    loading: loadingGroups,
    saving: savingGroups,
    handleGroupMove, 
    handleGroupSelect 
  } = useReorderGroups(activeProduct, fetchComplementGroupsByProduct);
  
  const { 
    groupComplements, 
    loadingComplements,
    saving: savingComplements, 
    handleComplementMove 
  } = useReorderComplements(activeGroup, fetchComplementsByGroup);

  // Load all data
  const loadAllData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadCategories(),
        loadProducts(),
        loadComplementGroups()
      ]);
    } catch (error) {
      toast.error("Erro ao carregar dados");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, loadCategories, loadProducts, loadComplementGroups]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle save & close actions
  const handleSave = async () => {
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
  };

  // Get display names for active items
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
    loadingProducts,
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
