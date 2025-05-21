
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
        try {
          console.log("Loading complement groups for product:", activeProduct);
          const groups = await fetchComplementGroupsByProduct(activeProduct);
          console.log("Loaded complement groups:", groups);
          setProductGroups(groups || []);
        } catch (error) {
          console.error("Error loading product groups:", error);
          setProductGroups([]);
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
    
    const currentIndex = productGroups.findIndex(g => g.id === id);
    if (currentIndex === -1) {
      console.error("Group not found:", id);
      return;
    }
    
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
      
      // Get the current order values or use indices as fallback
      const currentOrder = productGroups[currentIndex].order ?? currentIndex;
      const targetOrder = targetGroup.order ?? targetIndex;
      
      console.log("Reordering group:", {
        currentGroupId: id,
        targetGroupId: targetGroup.id,
        productGroupId: productGroups[currentIndex].productGroupId,
        targetGroupProductId: targetGroup.productGroupId,
        currentOrder,
        targetOrder
      });
      
      // Check if productGroupId exists before updating
      if (!productGroups[currentIndex].productGroupId || !targetGroup.productGroupId) {
        console.error("Missing productGroupId for one or both groups");
        throw new Error("Missing productGroupId for groups");
      }
      
      // Update first group's order - using productGroupId which is the ID from product_complement_groups table
      const { error: updateError } = await supabase
        .from("product_complement_groups")
        .update({ order: targetOrder })
        .eq("id", productGroups[currentIndex].productGroupId);
        
      if (updateError) {
        console.error("Error updating first group:", updateError);
        throw updateError;
      }
      
      // Update second group's order
      const { error: updateTargetError } = await supabase
        .from("product_complement_groups")
        .update({ order: currentOrder })
        .eq("id", targetGroup.productGroupId);
        
      if (updateTargetError) {
        console.error("Error updating second group:", updateTargetError);
        throw updateTargetError;
      }
      
      // Update local state first to provide immediate feedback
      const updatedGroups = [...productGroups];
      [updatedGroups[currentIndex], updatedGroups[targetIndex]] = 
        [updatedGroups[targetIndex], updatedGroups[currentIndex]];
      setProductGroups(updatedGroups);
      
      // Then reload from database to ensure consistency
      const updatedGroupsData = await fetchComplementGroupsByProduct(activeProduct);
      setProductGroups(updatedGroupsData || []);
      
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
