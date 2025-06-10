
import { useState, useEffect } from "react";
import { useReorderLogic } from "./useReorderLogic";

export const useReorderGroups = (
  activeProduct: number | null,
  fetchComplementGroupsByProduct: (productId: number) => Promise<any[]>
) => {
  const [productGroups, setProductGroups] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const { reorderGroups } = useReorderLogic();

  useEffect(() => {
    const loadProductGroups = async () => {
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
    };

    loadProductGroups();
  }, [activeProduct, fetchComplementGroupsByProduct]);

  const handleGroupMove = async (id: number, direction: 'up' | 'down') => {
    if (saving || !activeProduct) return;

    setSaving(true);
    
    const formattedGroups = productGroups.map(group => ({
      id: group.id, // Usar o ID correto do registro na tabela product_complement_groups
      name: group.name,
      order: group.order || 0,
      isActive: group.isActive
    }));

    const success = await reorderGroups(
      formattedGroups,
      id,
      direction,
      async () => {
        const updatedGroupsData = await fetchComplementGroupsByProduct(activeProduct);
        const sortedUpdatedGroups = [...updatedGroupsData].sort((a, b) => {
          const orderA = a.order ?? 999999;
          const orderB = b.order ?? 999999;
          return orderA - orderB;
        });
        setProductGroups(sortedUpdatedGroups || []);
      }
    );
    
    setSaving(false);
    return success;
  };

  const handleGroupSelect = (groupId: number) => {
    setActiveGroup(activeGroup === groupId ? null : groupId);
  };

  return {
    productGroups,
    activeGroup,
    saving,
    loading,
    handleGroupMove,
    handleGroupSelect
  };
};
