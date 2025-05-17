
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useGroupComplements = () => {
  const [loading, setLoading] = useState(false);
  const [groupComplements, setGroupComplements] = useState<any[]>([]);

  const fetchComplementsByGroup = async (groupId: number) => {
    if (!groupId) return [];
    
    try {
      setLoading(true);
      
      // First fetch all complements linked to this group
      const { data, error } = await supabase
        .from("complements")
        .select("*")
        .eq("is_active", true);
        
      if (error) throw error;
      
      // Format the data for the component
      const complements = data.map(comp => ({
        id: comp.id,
        name: comp.name,
        groupId: groupId,
        isActive: comp.is_active
      }));
      
      setGroupComplements(complements);
      return complements;
    } catch (error: any) {
      toast.error("Erro ao carregar complementos do grupo");
      console.error("Error fetching group complements:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    groupComplements,
    fetchComplementsByGroup
  };
};
