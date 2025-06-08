
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
          
          console.log("Sorted groups:", sortedGroups.map(g => ({ id: g.id, name: g.name, order: g.order })));
          
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
    console.log("=== GROUP MOVE START ===");
    console.log("Moving group ID:", id, "direction:", direction);
    console.log("Available product groups:", productGroups);

    if (!activeProduct || !productGroups || productGroups.length === 0) {
      console.error("No product groups available to reorder");
      toast.error("Nenhum grupo disponível para reordenar");
      return;
    }
    
    // Sort groups by order to ensure consistent indexing
    const sortedGroups = [...productGroups].sort((a, b) => {
      const orderA = a.order ?? 999999;
      const orderB = b.order ?? 999999;
      return orderA - orderB;
    });
    
    console.log("Sorted groups:", sortedGroups.map(g => ({ id: g.id, name: g.name, order: g.order, productGroupId: g.productGroupId })));
    
    const currentIndex = sortedGroups.findIndex(g => g.id === id);
    if (currentIndex === -1) {
      console.error("Group not found:", id);
      toast.error("Grupo não encontrado");
      return;
    }
    
    // Check if move is valid
    if (direction === 'up' && currentIndex === 0) {
      console.log("Already at top, cannot move up");
      return;
    }
    if (direction === 'down' && currentIndex === sortedGroups.length - 1) {
      console.log("Already at bottom, cannot move down");
      return;
    }
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentGroup = sortedGroups[currentIndex];
    const targetGroup = sortedGroups[targetIndex];
    
    console.log("Current group:", { id: currentGroup.id, name: currentGroup.name, order: currentGroup.order, productGroupId: currentGroup.productGroupId });
    console.log("Target group:", { id: targetGroup.id, name: targetGroup.name, order: targetGroup.order, productGroupId: targetGroup.productGroupId });
    
    const currentOrder = currentGroup.order ?? 0;
    const targetOrder = targetGroup.order ?? 0;
    
    try {
      setSaving(true);
      console.log("Starting database update...");
      
      // Validate productGroupId exists
      if (!currentGroup.productGroupId || !targetGroup.productGroupId) {
        console.error("Missing productGroupId for one or both groups");
        throw new Error("Missing productGroupId for groups");
      }
      
      // Update both groups in the database using productGroupId (the junction table ID)
      const { error: updateCurrentError } = await supabase
        .from("product_complement_groups")
        .update({ order: targetOrder })
        .eq("id", currentGroup.productGroupId);
        
      if (updateCurrentError) {
        console.error("Error updating current group:", updateCurrentError);
        throw updateCurrentError;
      }
      console.log("Current group updated successfully");
      
      const { error: updateTargetError } = await supabase
        .from("product_complement_groups")
        .update({ order: currentOrder })
        .eq("id", targetGroup.productGroupId);
        
      if (updateTargetError) {
        console.error("Error updating target group:", updateTargetError);
        throw updateTargetError;
      }
      console.log("Target group updated successfully");
      
      // Reload groups to reflect changes
      console.log("Reloading groups...");
      const updatedGroupsData = await fetchComplementGroupsByProduct(activeProduct);
      const sortedUpdatedGroups = [...updatedGroupsData].sort((a, b) => {
        const orderA = a.order ?? 999999;
        const orderB = b.order ?? 999999;
        return orderA - orderB;
      });
      
      setProductGroups(sortedUpdatedGroups || []);
      console.log("Groups reloaded successfully");
      
      toast.success("Ordem atualizada com sucesso");
    } catch (error) {
      console.error("Error updating group order:", error);
      toast.error("Erro ao atualizar ordem dos grupos");
    } finally {
      setSaving(false);
      console.log("=== GROUP MOVE END ===");
    }
  };

  const handleGroupSelect = (groupId: number) => {
    console.log("Selecting group:", groupId);
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
