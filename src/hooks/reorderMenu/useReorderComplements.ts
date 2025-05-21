
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
          setGroupComplements(complements || []);
        } catch (error) {
          console.error("Error loading complements:", error);
          toast.error("Erro ao carregar complementos");
          setGroupComplements([]);
        } finally {
          setLoadingComplements(false);
        }
      } else {
        setGroupComplements([]);
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
    
    const currentIndex = groupComplements.findIndex(c => c.id === id);
    if (currentIndex === -1) {
      console.error("Complement not found:", id);
      return;
    }
    
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
      
      // Get the current order values or use indices as fallback
      const currentOrder = groupComplements[currentIndex].order ?? currentIndex;
      const targetOrder = targetComplement.order ?? targetIndex;
      
      console.log("Reordering complement:", {
        current: groupComplements[currentIndex],
        target: targetComplement,
        currentOrder,
        targetOrder
      });
      
      // Determine which table to update based on the complement type
      // Check if the specific complement ID exists
      const isSpecificComplement = 'specificId' in groupComplements[currentIndex] && 
                                  groupComplements[currentIndex].specificId;
      
      const isSpecificTargetComplement = 'specificId' in targetComplement && 
                                       targetComplement.specificId;
                                       
      if (isSpecificComplement !== isSpecificTargetComplement) {
        console.error("Mixed complement types, cannot reorder");
        throw new Error("Mixed complement types, cannot reorder");
      }
      
      if (isSpecificComplement) {
        // Update first complement's order
        const { error: updateError } = await supabase
          .from("product_specific_complements")
          .update({ order: targetOrder })
          .eq("id", groupComplements[currentIndex].specificId);
          
        if (updateError) {
          console.error("Error updating first complement:", updateError);
          throw updateError;
        }
        
        // Update second complement's order
        const { error: updateTargetError } = await supabase
          .from("product_specific_complements")
          .update({ order: currentOrder })
          .eq("id", targetComplement.specificId);
          
        if (updateTargetError) {
          console.error("Error updating second complement:", updateTargetError);
          throw updateTargetError;
        }
      } else {
        // Update first complement's order in complement_items table
        const { error: updateError } = await supabase
          .from("complement_items")
          .update({ order: targetOrder })
          .eq("id", groupComplements[currentIndex].id);
          
        if (updateError) {
          console.error("Error updating first complement item:", updateError);
          throw updateError;
        }
        
        // Update second complement's order
        const { error: updateTargetError } = await supabase
          .from("complement_items")
          .update({ order: currentOrder })
          .eq("id", targetComplement.id);
          
        if (updateTargetError) {
          console.error("Error updating second complement item:", updateTargetError);
          throw updateTargetError;
        }
      }
      
      // Update local state for immediate feedback
      const updatedComplements = [...groupComplements];
      [updatedComplements[currentIndex], updatedComplements[targetIndex]] = 
        [updatedComplements[targetIndex], updatedComplements[currentIndex]];
      setGroupComplements(updatedComplements);
      
      // Then reload from database to ensure consistency
      const updatedComplementsData = await fetchComplementsByGroup(activeGroup);
      setGroupComplements(updatedComplementsData || []);
      
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
