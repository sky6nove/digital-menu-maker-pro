
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useReorderComplements = (
  activeGroup: number | null,
  fetchComplementsByGroup: (groupId: number) => Promise<any[]>
) => {
  const [groupComplements, setGroupComplements] = useState<any[]>([]);
  const [loadingComplements, setLoadingComplements] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load complements when a group is selected
  useEffect(() => {
    const loadGroupComplements = async () => {
      if (activeGroup) {
        setLoadingComplements(true);
        try {
          console.log("Fetching complements for group:", activeGroup);
          const complements = await fetchComplementsByGroup(activeGroup);
          console.log("Fetched complements:", complements);
          
          // Sort by order, handling null values properly
          const sortedComplements = [...complements].sort((a, b) => {
            const orderA = a.order ?? 999999;
            const orderB = b.order ?? 999999;
            if (orderA !== orderB) return orderA - orderB;
            return a.name.localeCompare(b.name);
          });
          
          setGroupComplements(sortedComplements || []);
        } catch (error) {
          console.error("Error loading complements:", error);
          toast.error("Erro ao carregar complementos");
          setGroupComplements([]);
        } finally {
          setLoadingComplements(false);
        }
      } else {
        setGroupComplements([]);
        setLoadingComplements(false);
      }
    };

    loadGroupComplements();
  }, [activeGroup, fetchComplementsByGroup]);

  // Handle reordering for complements
  const handleComplementMove = async (id: number, direction: 'up' | 'down') => {
    if (!activeGroup || !groupComplements || groupComplements.length === 0) {
      console.error("No complements available to reorder");
      return;
    }
    
    // Sort complements by order to ensure consistent indexing
    const sortedComplements = [...groupComplements].sort((a, b) => {
      const orderA = a.order ?? 999999;
      const orderB = b.order ?? 999999;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
    
    const currentIndex = sortedComplements.findIndex(c => c.id === id);
    if (currentIndex === -1) {
      console.error("Complement not found:", id);
      return;
    }
    
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= sortedComplements.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentComplement = sortedComplements[currentIndex];
    const targetComplement = sortedComplements[targetIndex];
    
    // Use the current order values
    const currentOrder = currentComplement.order ?? 0;
    const targetOrder = targetComplement.order ?? 0;
    
    console.log("Reordering complement:", {
      current: currentComplement,
      target: targetComplement,
      currentOrder,
      targetOrder,
      direction
    });
    
    try {
      setSaving(true);
      
      // Determine which table to update based on the complement type
      const isSpecificComplement = 'specificId' in currentComplement && 
                                  currentComplement.specificId;
      
      const isSpecificTargetComplement = 'specificId' in targetComplement && 
                                       targetComplement.specificId;
                                       
      if (isSpecificComplement !== isSpecificTargetComplement) {
        console.error("Mixed complement types, cannot reorder");
        throw new Error("Mixed complement types, cannot reorder");
      }
      
      if (isSpecificComplement) {
        // Update in product_specific_complements table
        const { error: updateCurrentError } = await supabase
          .from("product_specific_complements")
          .update({ order: targetOrder })
          .eq("id", currentComplement.specificId);
          
        if (updateCurrentError) {
          console.error("Error updating current complement:", updateCurrentError);
          throw updateCurrentError;
        }
        
        const { error: updateTargetError } = await supabase
          .from("product_specific_complements")
          .update({ order: currentOrder })
          .eq("id", targetComplement.specificId);
          
        if (updateTargetError) {
          console.error("Error updating target complement:", updateTargetError);
          throw updateTargetError;
        }
      } else {
        // Update in complement_items table
        const { error: updateCurrentError } = await supabase
          .from("complement_items")
          .update({ order: targetOrder })
          .eq("id", currentComplement.id);
          
        if (updateCurrentError) {
          console.error("Error updating current complement item:", updateCurrentError);
          throw updateCurrentError;
        }
        
        const { error: updateTargetError } = await supabase
          .from("complement_items")
          .update({ order: currentOrder })
          .eq("id", targetComplement.id);
          
        if (updateTargetError) {
          console.error("Error updating target complement item:", updateTargetError);
          throw updateTargetError;
        }
      }
      
      // Reload from database to ensure consistency
      const updatedComplementsData = await fetchComplementsByGroup(activeGroup);
      
      // Sort the updated complements by order
      const sortedUpdatedComplements = [...updatedComplementsData].sort((a, b) => {
        const orderA = a.order ?? 999999;
        const orderB = b.order ?? 999999;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      });
      
      setGroupComplements(sortedUpdatedComplements || []);
      
      toast.success("Ordem atualizada");
    } catch (error) {
      console.error("Error updating complement order:", error);
      toast.error("Erro ao atualizar ordem de complementos");
    } finally {
      setSaving(false);
    }
  };

  return {
    groupComplements,
    loadingComplements,
    saving,
    handleComplementMove
  };
};
