
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
      
      // Find the source entry for the current complement
      const { data: sourceData, error: sourceError } = await supabase
        .from("product_specific_complements")
        .select("id")
        .eq("complement_id", id)
        .eq("complement_group_id", activeGroup)
        .single();
        
      if (sourceError) throw sourceError;
      
      // Find the target entry for the target complement
      const { data: targetData, error: targetError } = await supabase
        .from("product_specific_complements")
        .select("id")
        .eq("complement_id", targetComplement.id)
        .eq("complement_group_id", activeGroup)
        .single();
        
      if (targetError) throw targetError;
      
      // Swap the IDs (which affects the order)
      const { error: updateSourceError } = await supabase
        .from("product_specific_complements")
        .update({ id: targetData.id })
        .eq("id", sourceData.id);
        
      if (updateSourceError) throw updateSourceError;
      
      const { error: updateTargetError } = await supabase
        .from("product_specific_complements")
        .update({ id: sourceData.id })
        .eq("id", targetData.id);
        
      if (updateTargetError) throw updateTargetError;
      
      // Reload complements
      const updatedComplements = await fetchComplementsByGroup(activeGroup);
      setGroupComplements(updatedComplements);
      
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
