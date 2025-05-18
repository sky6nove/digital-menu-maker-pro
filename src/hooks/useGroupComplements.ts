
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
      
      // First fetch all complements linked to this group through the product_specific_complements table
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
        
      if (specificError) {
        console.error("Error fetching specific complements:", specificError);
        throw specificError;
      }
      
      // If no specific complements found, try fetching from complement_items
      if (!specificComplements || specificComplements.length === 0) {
        const { data: complementItems, error: itemsError } = await supabase
          .from("complement_items")
          .select(`
            id,
            name,
            price,
            is_active
          `)
          .eq("group_id", groupId)
          .order('id');
          
        if (itemsError) {
          console.error("Error fetching complement items:", itemsError);
          throw itemsError;
        }
        
        // Format the items data for the component
        const formattedItems = (complementItems || []).map(item => ({
          id: item.id,
          name: item.name,
          groupId: groupId,
          isActive: item.is_active !== false,
          price: item.price || 0
        }));
        
        setGroupComplements(formattedItems);
        return formattedItems;
      }
      
      // Format the specific complements data for the component
      const complements = specificComplements.map(item => ({
        id: item.complement_id,
        specificId: item.id, // Store the product_specific_complements ID
        name: item.complements?.name || 'Complemento sem nome',
        groupId: groupId,
        isActive: item.is_active !== false,
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
