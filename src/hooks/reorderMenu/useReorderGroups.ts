
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
    if (!activeProduct) {
      setProductGroups([]);
      setActiveGroup(null);
      return;
    }

    try {
      setLoading(true);
      const groups = await fetchComplementGroupsByProduct(activeProduct);
      
      const sortedGroups = [...(groups || [])].sort((a, b) => {
        const orderA = a.order ?? 999999;
        const orderB = b.order ?? 999999;
        return orderA - orderB;
      });
      
      setProductGroups(sortedGroups);
    } catch (error) {
      console.error("Error loading product groups:", error);
      setProductGroups([]);
    } finally {
      setLoading(false);
    }
    setActiveGroup(null);
  }, [activeProduct, fetchComplementGroupsByProduct]);

  useEffect(() => {
    loadProductGroups();
  }, [activeProduct]);

  const handleGroupMove = useCallback(async (id: number, direction: 'up' | 'down') => {
    if (saving || !activeProduct) return;

    setSaving(true);
    
    try {
      // Use productGroupId consistently for reorder operation
      const formattedGroups = productGroups.map(group => ({
        id: group.productGroupId || group.id, // Use productGroupId as the primary ID for reordering
        name: group.name,
        order: group.order || 0,
        isActive: group.isActive
      }));

      console.log("Formatted groups for reordering:", formattedGroups);
      console.log("Moving group with ID:", id);

      const success = await reorderItems(
        formattedGroups,
        id, // This should match the productGroupId
        direction,
        'product_complement_groups'
      );
      
      if (success) {
        await loadProductGroups();
      }
      
      return success;
    } finally {
      setSaving(false);
    }
  }, [productGroups, activeProduct, reorderItems, loadProductGroups, saving]);

  const handleGroupSelect = useCallback((groupId: number) => {
    // Find the group to get the correct complement_group_id for loading complements
    const selectedGroup = productGroups.find(group => 
      (group.productGroupId || group.id) === groupId
    );
    
    // Use the complement_group_id (the original group ID) for activeGroup
    const complementGroupId = selectedGroup ? selectedGroup.id : groupId;
    
    console.log("Group selection:", { 
      clickedId: groupId, 
      complementGroupId, 
      selectedGroup 
    });
    
    setActiveGroup(activeGroup === complementGroupId ? null : complementGroupId);
  }, [activeGroup, productGroups]);

  return {
    productGroups,
    activeGroup,
    saving,
    loading,
    handleGroupMove,
    handleGroupSelect
  };
};
