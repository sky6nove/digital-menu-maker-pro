
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProductMenuComplements = () => {
  const [loading, setLoading] = useState(false);
  const [complements, setComplements] = useState<any[]>([]);

  const fetchComplementsForGroup = async (groupId: number) => {
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
          complements:complement_id(id, name, price, is_active)
        `)
        .eq("complement_group_id", groupId)
        .order('id');
        
      if (specificError) throw specificError;
      
      if (specificComplements && specificComplements.length > 0) {
        // Format the data for the components
        const formattedComplements = specificComplements.map(item => ({
          id: item.complement_id,
          name: item.complements?.name || 'Complement',
          groupId: groupId,
          isActive: item.is_active !== false,
          price: item.custom_price || item.complements?.price || 0
        }));
        
        setComplements(formattedComplements);
        return formattedComplements;
      }
      
      // If no specific complements, fetch from complement_items
      const { data: items, error: itemsError } = await supabase
        .from("complement_items")
        .select(`
          id,
          name,
          price,
          is_active
        `)
        .eq("group_id", groupId)
        .order('id');
        
      if (itemsError) throw itemsError;
      
      // Format the items data
      const formattedItems = (items || []).map(item => ({
        id: item.id,
        name: item.name,
        groupId: groupId,
        isActive: item.is_active !== false,
        price: item.price || 0
      }));
      
      setComplements(formattedItems);
      return formattedItems;
    } catch (error) {
      console.error("Error fetching complements:", error);
      toast.error("Erro ao carregar complementos");
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    complements,
    fetchComplementsForGroup
  };
};
