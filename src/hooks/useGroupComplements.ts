
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
      
      // First try to fetch product-specific complements
      const { data: specificComplements, error: specificError } = await supabase
        .from("product_specific_complements")
        .select(`
          id,
          complement_id,
          is_active,
          custom_price,
          "order",
          complements:complement_id(id, name, price, is_active)
        `)
        .eq("complement_group_id", groupId)
        .order('order');
        
      if (specificError) {
        console.error("Error fetching specific complements:", specificError);
        throw specificError;
      }
      
      // If specific complements found, format and return them
      if (specificComplements && specificComplements.length > 0) {
        // Format the specific complements data for the component
        const complements = (specificComplements || []).map(item => ({
          id: item.complement_id,
          specificId: item.id, // Store the product_specific_complements ID
          name: item.complements?.name || 'Complemento sem nome',
          groupId: groupId,
          isActive: item.is_active !== false,
          price: item.custom_price || item.complements?.price || 0,
          order: item.order
        }));
        
        setGroupComplements(complements);
        return complements;
      }
      
      // If no specific complements, try fetching from complement_items
      const { data: complementItems, error: itemsError } = await supabase
        .from("complement_items")
        .select(`
          id,
          name,
          price,
          is_active,
          "order"
        `)
        .eq("group_id", groupId)
        .order('order');
          
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
        price: item.price || 0,
        order: item.order
      }));
      
      setGroupComplements(formattedItems);
      return formattedItems;
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
