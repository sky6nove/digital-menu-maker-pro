
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useReorderGroups = (
  activeProduct: number | null,
  fetchComplementGroupsByProduct: (productId: number) => Promise<any[]>
) => {
  const [productGroups, setProductGroups] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

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
    };

    loadProductGroups();
  }, [activeProduct, fetchComplementGroupsByProduct]);

  // Handle reordering for complement groups
  const handleGroupMove = async (id: number, direction: 'up' | 'down') => {
    if (!activeProduct) return;
    
    const currentIndex = productGroups.findIndex(g => g.id === id);
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= productGroups.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    try {
      setSaving(true);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetGroup = productGroups[targetIndex];
      
      // Create a temporary array to hold the updated groups order
      const updatedGroups = [...productGroups];
      
      // Swap the positions in the array
      [updatedGroups[currentIndex], updatedGroups[targetIndex]] = 
        [updatedGroups[targetIndex], updatedGroups[currentIndex]];
      
      // Update the database with the new order
      // For each position, update the database record
      for (let i = 0; i < updatedGroups.length; i++) {
        const { error } = await supabase
          .from("product_complement_groups")
          .update({ order: i })
          .eq("id", updatedGroups[i].id);
          
        if (error) {
          console.error(`Error updating order for group ${updatedGroups[i].id}:`, error);
          throw error;
        }
      }
      
      // Reload product groups
      const updatedGroupsData = await fetchComplementGroupsByProduct(activeProduct);
      setProductGroups(updatedGroupsData);
      
      toast.success("Ordem atualizada");
    } catch (error) {
      console.error("Error updating group order:", error);
      toast.error("Erro ao atualizar ordem de grupos");
    } finally {
      setSaving(false);
    }
  };

  const handleGroupSelect = (groupId: number) => {
    setActiveGroup(activeGroup === groupId ? null : groupId);
  };

  return {
    productGroups,
    activeGroup,
    saving,
    handleGroupMove,
    handleGroupSelect
  };
};
