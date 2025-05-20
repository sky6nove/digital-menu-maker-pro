
import { useState, useEffect } from "react";

export const useMenuSelection = (
  products: any[], 
  fetchComplementGroupsByProduct: (id: number) => Promise<any[]>,
  fetchComplementsByGroup: (id: number) => Promise<any[]>
) => {
  // State management
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [productGroups, setProductGroups] = useState<any[]>([]);
  const [groupComplements, setGroupComplements] = useState<any[]>([]);

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
        try {
          const groups = await fetchComplementGroupsByProduct(activeProduct);
          setProductGroups(groups || []);
        } catch (error) {
          console.error("Error loading product groups:", error);
          setProductGroups([]);
        }
      } else {
        setProductGroups([]);
      }
      setActiveGroup(null); // Reset group selection
      setGroupComplements([]); // Clear group complements
    };

    loadProductGroups();
  }, [activeProduct, fetchComplementGroupsByProduct]);

  // Load complements when a group is selected
  useEffect(() => {
    const loadGroupComplements = async () => {
      if (activeGroup) {
        try {
          const complements = await fetchComplementsByGroup(activeGroup);
          setGroupComplements(complements || []);
          
          if (complements.length === 0) {
            console.log("No complements found for group", activeGroup);
          }
        } catch (error) {
          console.error("Error loading complementes:", error);
          setGroupComplements([]);
        }
      } else {
        setGroupComplements([]);
      }
    };

    loadGroupComplements();
  }, [activeGroup, fetchComplementsByGroup]);

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

  return {
    activeCategory,
    activeProduct,
    activeGroup,
    filteredProducts,
    productGroups,
    groupComplements,
    handleCategorySelect,
    handleProductSelect,
    handleGroupSelect,
    setGroupComplements
  };
};
