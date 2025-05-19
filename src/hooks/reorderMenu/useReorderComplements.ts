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
      
      // Create a temporary array to hold the updated complements order
      const updatedComplements = [...groupComplements];
      
      // Swap the positions in the array
      [updatedComplements[currentIndex], updatedComplements[targetIndex]] = 
        [updatedComplements[targetIndex], updatedComplements[currentIndex]];
      
      // Update the database with the new order
      // For each position, update the database record
      for (let i = 0; i < updatedComplements.length; i++) {
        // If we have a specificId (from product_specific_complements), use it
        // Otherwise, directly update the complement's order
        if (updatedComplements[i].specificId) {
          const { error } = await supabase
            .from("product_specific_complements")
            .update({ order: i })
            .eq("id", updatedComplements[i].specificId);
            
          if (error) {
            console.error(`Error updating order for complement ${updatedComplements[i].id}:`, error);
            throw error;
          }
        } else {
          const { error } = await supabase
            .from("complement_items")
            .update({ order: i })
            .eq("id", updatedComplements[i].id)
            .eq("group_id", activeGroup);
            
          if (error) {
            console.error(`Error updating order for complement item ${updatedComplements[i].id}:`, error);
            throw error;
          }
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
