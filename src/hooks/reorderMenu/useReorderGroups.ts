
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
  const [loading, setLoading] = useState(false);

  // Load product complement groups when a product is selected
  useEffect(() => {
    const loadProductGroups = async () => {
      if (activeProduct) {
        try {
          setLoading(true);
          console.log("Loading complement groups for product:", activeProduct);
          const groups = await fetchComplementGroupsByProduct(activeProduct);
          console.log("Loaded complement groups:", groups);
          
          // Sort by order, handling null values properly
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
      setActiveGroup(null); // Reset group selection
    };

    loadProductGroups();
  }, [activeProduct, fetchComplementGroupsByProduct]);

  // Handle reordering for complement groups
  const handleGroupMove = async (id: number, direction: 'up' | 'down') => {
    if (!activeProduct || !productGroups || productGroups.length === 0) {
      console.error("No product groups available to reorder");
      return;
    }
    
    // Sort groups by order to ensure consistent indexing
    const sortedGroups = [...productGroups].sort((a, b) => {
      const orderA = a.order ?? 999999;
      const orderB = b.order ?? 999999;
      return orderA - orderB;
    });
    
    const currentIndex = sortedGroups.findIndex(g => g.id === id);
    if (currentIndex === -1) {
      console.error("Group not found:", id);
      return;
    }
    
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= sortedGroups.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentGroup = sortedGroups[currentIndex];
    const targetGroup = sortedGroups[targetIndex];
    
    // Use the current order values
    const currentOrder = currentGroup.order ?? 0;
    const targetOrder = targetGroup.order ?? 0;
    
    console.log("Reordering group:", {
      currentGroupId: id,
      targetGroupId: targetGroup.id,
      productGroupId: currentGroup.productGroupId,
      targetGroupProductId: targetGroup.productGroupId,
      currentOrder,
      targetOrder,
      direction
    });
    
    try {
      setSaving(true);
      
      // Validate productGroupId exists
      if (!currentGroup.productGroupId || !targetGroup.productGroupId) {
        console.error("Missing productGroupId for one or both groups");
        throw new Error("Missing productGroupId for groups");
      }
      
      // Swap order values using productGroupId (the junction table ID)
      const { error: updateCurrentError } = await supabase
        .from("product_complement_groups")
        .update({ order: targetOrder })
        .eq("id", currentGroup.productGroupId);
        
      if (updateCurrentError) {
        console.error("Error updating current group:", updateCurrentError);
        throw updateCurrentError;
      }
      
      const { error: updateTargetError } = await supabase
        .from("product_complement_groups")
        .update({ order: currentOrder })
        .eq("id", targetGroup.productGroupId);
        
      if (updateTargetError) {
        console.error("Error updating target group:", updateTargetError);
        throw updateTargetError;
      }
      
      // Reload groups to reflect changes
      const updatedGroupsData = await fetchComplementGroupsByProduct(activeProduct);
      const sortedUpdatedGroups = [...updatedGroupsData].sort((a, b) => {
        const orderA = a.order ?? 999999;
        const orderB = b.order ?? 999999;
        return orderA - orderB;
      });
      
      setProductGroups(sortedUpdatedGroups || []);
      
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
    loading,
    handleGroupMove,
    handleGroupSelect
  };
};
