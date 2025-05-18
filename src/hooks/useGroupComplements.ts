
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
      const { data: specificComplements, error: specificError } = await supabase
        .from("product_specific_complements")
        .select(`
          id,
          complement_id,
          is_active,
          custom_price,
          complements:complement_id(id, name, price, is_active)
        `)
        .eq("complement_group_id", groupId)
        .order('id');
        
      if (specificError) throw specificError;
      
      // Format the data for the component
      const complements = specificComplements.map(item => ({
        id: item.complement_id,
        name: item.complements?.name || 'Unnamed Complement',
        groupId: groupId,
        isActive: item.is_active,
        price: item.custom_price || item.complements?.price || 0
      }));
      
      setGroupComplements(complements);
      return complements;
    } catch (error: any) {
      console.error("Error fetching group complements:", error);
      toast.error("Erro ao carregar complementos do grupo");
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
