
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
          const complements = await fetchComplementsByGroup(activeGroup);
          setGroupComplements(complements || []);
          
          if (complements.length === 0) {
            console.log("No complements found for group", activeGroup);
          }
        } catch (error) {
          console.error("Error loading complementes:", error);
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
    if (!activeGroup || !groupComplements || groupComplements.length === 0) return;
    
    const currentIndex = groupComplements.findIndex(c => c.id === id);
    if (currentIndex === -1) return;
    
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
      
      // Determine which table to update based on the complement type
      const isSpecificComplement = 'specificId' in groupComplements[currentIndex] && 
                                  groupComplements[currentIndex].specificId;
      
      if (isSpecificComplement) {
        console.log("Updating product_specific_complements order", {
          currentId: groupComplements[currentIndex].specificId,
          targetId: targetComplement.specificId,
          currentOrder,
          targetOrder
        });
        
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
        console.log("Updating complement_items order", {
          currentId: groupComplements[currentIndex].id,
          targetId: targetComplement.id,
          currentOrder,
          targetOrder,
          groupId: activeGroup
        });
        
        // Update first complement's order
        const { error: updateError } = await supabase
          .from("complement_items")
          .update({ order: targetOrder })
          .eq("id", groupComplements[currentIndex].id)
          .eq("group_id", activeGroup);
          
        if (updateError) {
          console.error("Error updating first complement item:", updateError);
          throw updateError;
        }
        
        // Update second complement's order
        const { error: updateTargetError } = await supabase
          .from("complement_items")
          .update({ order: currentOrder })
          .eq("id", targetComplement.id)
          .eq("group_id", activeGroup);
          
        if (updateTargetError) {
          console.error("Error updating second complement item:", updateTargetError);
          throw updateTargetError;
        }
      }
      
      // Reload complements to reflect the updated order
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
