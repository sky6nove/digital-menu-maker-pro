
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
          setGroupComplements(complements);
          
          if (complements.length === 0) {
            console.log("No complements found for group", activeGroup);
          }
        } catch (error) {
          console.error("Error loading complementes:", error);
          toast.error("Erro ao carregar complementos");
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
    if (!activeGroup) return;
    
    const currentIndex = groupComplements.findIndex(c => c.id === id);
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
      
      // Create a temporary array to hold the updated complements order
      const updatedComplements = [...groupComplements];
      
      // Swap the positions in the array
      [updatedComplements[currentIndex], updatedComplements[targetIndex]] = 
        [updatedComplements[targetIndex], updatedComplements[currentIndex]];
      
      // Update the database using a two-phase approach with temporary IDs
      // Handle different tables based on the complement type
      for (let i = 0; i < updatedComplements.length; i++) {
        if (updatedComplements[i].specificId) {
          // For product_specific_complements
          await supabase
            .from("product_specific_complements")
            .update({ id: i + 10000 }) // Temporary high ID
            .eq("id", updatedComplements[i].specificId);
        } else {
          // For complement_items
          await supabase
            .from("complement_items")
            .update({ id: i + 10000 }) // Temporary high ID
            .eq("id", updatedComplements[i].id)
            .eq("group_id", activeGroup);
        }
      }
      
      // Now update with final IDs
      for (let i = 0; i < updatedComplements.length; i++) {
        const originalId = updatedComplements[i].id === id ? targetComplement.id : 
                           updatedComplements[i].id === targetComplement.id ? id : 
                           updatedComplements[i].id;
        
        if (updatedComplements[i].specificId) {
          const originalSpecificId = updatedComplements[i].specificId === updatedComplements[currentIndex].specificId ? 
                                    updatedComplements[targetIndex].specificId : 
                                    updatedComplements[i].specificId === updatedComplements[targetIndex].specificId ? 
                                    updatedComplements[currentIndex].specificId : 
                                    updatedComplements[i].specificId;
                                    
          await supabase
            .from("product_specific_complements")
            .update({ id: originalSpecificId })
            .eq("id", i + 10000);
        } else {
          await supabase
            .from("complement_items")
            .update({ id: originalId })
            .eq("id", i + 10000)
            .eq("group_id", activeGroup);
        }
      }
      
      // Reload complements
      const updatedComplementsData = await fetchComplementsByGroup(activeGroup);
      setGroupComplements(updatedComplementsData);
      
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
