
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "./useProducts";
import { useCategories } from "./useCategories";
import { useComplementGroups } from "./useComplementGroups";
import { useProductComplementGroups } from "./useProductComplementGroups";
import { useGroupComplements } from "./useGroupComplements";

export const useReorderMenu = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Import hooks
  const { products, loadProducts } = useProducts(user?.id);
  const { categories, loadCategories } = useCategories(user?.id);
  const { complementGroups, loadComplementGroups } = useComplementGroups();
  const { fetchComplementGroupsByProduct } = useProductComplementGroups();
  const { fetchComplementsByGroup, loading: loadingComplements } = useGroupComplements();
  
  // State management
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [productGroups, setProductGroups] = useState<any[]>([]);
  const [groupComplements, setGroupComplements] = useState<any[]>([]);

  // Load all data
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
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
      };

      fetchData();
    }
  }, [user]);

  // Update filtered products when activeCategory changes
  useEffect(() => {
    if (activeCategory) {
      setFilteredProducts(products.filter(p => p.categoryId === activeCategory));
      setActiveProduct(null); // Reset product selection
      setActiveGroup(null); // Reset group selection
      setProductGroups([]); // Clear product groups
      setGroupComplements([]); // Clear group complements
    } else {
      setFilteredProducts([]);
    }
  }, [activeCategory, products]);

  // Load product complement groups when a product is selected
  useEffect(() => {
    const loadProductGroups = async () => {
      if (activeProduct) {
        const groups = await fetchComplementGroupsByProduct(activeProduct);
        setProductGroups(groups);
      } else {
        setProductGroups([]);
      }
      setActiveGroup(null); // Reset group selection
      setGroupComplements([]); // Clear group complements
    };

    loadProductGroups();
  }, [activeProduct]);

  // Load complements when a group is selected
  useEffect(() => {
    const loadGroupComplements = async () => {
      if (activeGroup) {
        try {
          const complements = await fetchComplementsByGroup(activeGroup);
          setGroupComplements(complements);
          
          if (complements.length === 0) {
            console.log("No complements found for group", activeGroup);
          }
        } catch (error) {
          console.error("Error loading complementes:", error);
          toast.error("Erro ao carregar complementos");
        }
      } else {
        setGroupComplements([]);
      }
    };

    loadGroupComplements();
  }, [activeGroup]);

  // Handle reordering for products
  const handleProductMove = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = products.findIndex(p => p.id === id);
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= products.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    try {
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetProduct = products[targetIndex];
      
      // Get the current display_order values, default to their array indices if undefined
      const currentDisplayOrder = products[currentIndex].display_order ?? currentIndex;
      const targetDisplayOrder = targetProduct.display_order ?? targetIndex;
      
      // Swap display_order values
      const { error: updateError } = await supabase
        .from("products")
        .update({ display_order: targetDisplayOrder })
        .eq("id", id);
        
      if (updateError) throw updateError;
      
      const { error: updateTargetError } = await supabase
        .from("products")
        .update({ display_order: currentDisplayOrder })
        .eq("id", targetProduct.id);
        
      if (updateTargetError) throw updateTargetError;
      
      await loadProducts(); // Reload products
      toast.success("Ordem atualizada");
    } catch (error) {
      console.error("Error updating product order:", error);
      toast.error("Erro ao atualizar ordem");
    }
  };

  // Handle reordering for categories
  const handleCategoryMove = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === id);
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= categories.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    try {
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetCategory = categories[targetIndex];
      
      // Use the swapCategoriesOrder method from CategoryService
      await supabase
        .from("categories")
        .update({ order: targetCategory.order })
        .eq("id", id);
        
      await supabase
        .from("categories")
        .update({ order: categories[currentIndex].order })
        .eq("id", targetCategory.id);
      
      await loadCategories(); // Reload categories
      toast.success("Ordem atualizada");
    } catch (error) {
      console.error("Error updating category order:", error);
      toast.error("Erro ao atualizar ordem");
    }
  };

  // Handle reordering for complement groups
  const handleGroupMove = async (id: number, direction: 'up' | 'down') => {
    // This would implement reordering of complement groups
    toast.info("Reordenação de grupos de complementos será implementada em breve");
  };

  // Handle reordering for complements
  const handleComplementMove = async (id: number, direction: 'up' | 'down') => {
    if (!activeGroup) return;
    
    const currentIndex = groupComplements.findIndex(c => c.id === id);
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= groupComplements.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    try {
      setSaving(true);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetComplement = groupComplements[targetIndex];
      
      // Update the product_specific_complements order
      const { error: updateError } = await supabase
        .from("product_specific_complements")
        .update({ id: targetComplement.id })
        .eq("complement_id", id)
        .eq("complement_group_id", activeGroup);
        
      if (updateError) throw updateError;
      
      const { error: updateTargetError } = await supabase
        .from("product_specific_complements")
        .update({ id: groupComplements[currentIndex].id })
        .eq("complement_id", targetComplement.id)
        .eq("complement_group_id", activeGroup);
        
      if (updateTargetError) throw updateTargetError;
      
      // Reload complements
      const updatedComplements = await fetchComplementsByGroup(activeGroup);
      setGroupComplements(updatedComplements);
      
      toast.success("Ordem atualizada");
    } catch (error) {
      console.error("Error updating complement order:", error);
      toast.error("Erro ao atualizar ordem");
    } finally {
      setSaving(false);
    }
  };

  // Selection handlers
  const handleCategorySelect = (categoryId: number) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
    setActiveProduct(null);
    setActiveGroup(null);
  };

  const handleProductSelect = (productId: number) => {
    setActiveProduct(activeProduct === productId ? null : productId);
    setActiveGroup(null);
  };

  const handleGroupSelect = (groupId: number) => {
    setActiveGroup(activeGroup === groupId ? null : groupId);
  };

  // Handle save & close actions
  const handleSave = async () => {
    setSaving(true);
    toast.success("Ordem salva com sucesso");
    setSaving(false);
    return true;
  };

  // Get display names for active items
  const activeCategoryName = activeCategory 
    ? categories.find(c => c.id === activeCategory)?.name 
    : '';

  const activeProductName = activeProduct
    ? products.find(p => p.id === activeProduct)?.name
    : '';

  const activeGroupName = activeGroup 
    ? productGroups.find(g => g.id === activeGroup)?.name 
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
