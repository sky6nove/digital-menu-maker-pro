
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
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Import hooks
  const { products, loadProducts } = useProducts(user?.id);
  const { categories, loadCategories } = useCategories(user?.id);
  const { complementGroups, loadComplementGroups } = useComplementGroups();
  const { fetchComplementGroupsByProduct } = useProductComplementGroups();
  const { fetchComplementsByGroup } = useGroupComplements();
  
  // Init specialized hooks
  const { 
    activeCategory, 
    handleCategoryMove, 
    handleCategorySelect
  } = useReorderCategories(categories, loadCategories);
  
  const { 
    filteredProducts, 
    activeProduct, 
    handleProductMove, 
    handleProductSelect 
  } = useReorderProducts(products, activeCategory, loadProducts);
  
  const { 
    productGroups, 
    activeGroup, 
    handleGroupMove, 
    handleGroupSelect 
  } = useReorderGroups(activeProduct, fetchComplementGroupsByProduct);
  
  const { 
    groupComplements, 
    loadingComplements, 
    handleComplementMove 
  } = useReorderComplements(activeGroup, fetchComplementsByGroup);

  // Load all data - using useCallback to prevent infinite loops
  const loadAllData = useCallback(async () => {
    if (!user || dataLoaded) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadCategories(),
        loadProducts(),
        loadComplementGroups()
      ]);
      setDataLoaded(true);
    } catch (error) {
      toast.error("Erro ao carregar dados");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, loadCategories, loadProducts, loadComplementGroups, dataLoaded]);

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle save & close actions
  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, you would save all the changes here
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate saving
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
    loadingComplements,
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
