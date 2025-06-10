
import { useState, useEffect, useCallback } from "react";
import { useReorderLogic } from "./useReorderLogic";

export const useReorderGroups = (
  activeProduct: number | null,
  fetchComplementGroupsByProduct: (productId: number) => Promise<any[]>
) => {
  const [productGroups, setProductGroups] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const { reorderItems } = useReorderLogic();

  const loadProductGroups = useCallback(async () => {
    if (activeProduct) {
      try {
        setLoading(true);
        const groups = await fetchComplementGroupsByProduct(activeProduct);
        
        const sortedGroups = [...groups].sort((a, b) => {
          const orderA = a.order ?? 999999;
          const orderB = b.order ?? 999999;
          return orderA - orderB;
        });
        
        setProductGroups(sortedGroups || []);
      } catch (error) {
        console.error("Error loading product groups:", error);
        setProductGroups([]);
      } finally {
        setLoading(false);
      }
    } else {
      setProductGroups([]);
    }
    setActiveGroup(null);
  }, [activeProduct, fetchComplementGroupsByProduct]);

  useEffect(() => {
    loadProductGroups();
  }, [loadProductGroups]);

  const handleGroupMove = useCallback(async (id: number, direction: 'up' | 'down') => {
    if (saving || !activeProduct) return;

    setSaving(true);
    
    const formattedGroups = productGroups.map(group => ({
      id: group.productGroupId || group.id,
      name: group.name,
      order: group.order || 0,
      isActive: group.isActive
    }));

    const success = await reorderItems(
      formattedGroups,
      id,
      direction,
      'product_complement_groups'
    );
    
    if (success) {
      await loadProductGroups();
    }
    
    setSaving(false);
    return success;
  }, [productGroups, saving, activeProduct, reorderItems, loadProductGroups]);

  const handleGroupSelect = useCallback((groupId: number) => {
    setActiveGroup(activeGroup === groupId ? null : groupId);
  }, [activeGroup]);

  return {
    productGroups,
    activeGroup,
    saving,
    loading,
    handleGroupMove,
    handleGroupSelect
  };
};
