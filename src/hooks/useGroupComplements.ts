
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useGroupComplements = () => {
  const [loading, setLoading] = useState(false);
  const [groupComplements, setGroupComplements] = useState<any[]>([]);

  const fetchComplementsByGroup = useCallback(async (groupId: number) => {
    if (!groupId) {
      console.error("No group ID provided");
      setGroupComplements([]);
      return [];
    }
    
    try {
      setLoading(true);
      console.log("Fetching complements for group ID:", groupId);
      
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
        .order('order', { ascending: true, nullsFirst: false });
        
      if (specificError) {
        console.error("Error fetching specific complements:", specificError);
      }
      
      console.log("Specific complements data:", specificComplements);
      
      if (specificComplements && specificComplements.length > 0) {
        const complements = specificComplements.map(item => ({
          id: item.complement_id,
          specificId: item.id,
          name: item.complements?.name || 'Complemento sem nome',
          groupId: groupId,
          isActive: item.is_active !== false,
          price: item.custom_price || item.complements?.price || 0,
          order: item.order ?? 999999
        }));
        
        const sortedComplements = [...complements].sort((a, b) => {
          const orderA = a.order ?? 999999;
          const orderB = b.order ?? 999999;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        });
        
        console.log("Formatted specific complements:", sortedComplements);
        setGroupComplements(sortedComplements);
        return sortedComplements;
      }
      
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
        .order('order', { ascending: true, nullsFirst: false });
          
      if (itemsError) {
        console.error("Error fetching complement items:", itemsError);
        throw itemsError;
      }
      
      console.log("Complement items data:", complementItems);
      
      const formattedItems = (complementItems || []).map(item => ({
        id: item.id,
        name: item.name,
        groupId: groupId,
        isActive: item.is_active !== false,
        price: item.price || 0,
        order: item.order ?? 999999
      }));
      
      const sortedItems = [...formattedItems].sort((a, b) => {
        const orderA = a.order ?? 999999;
        const orderB = b.order ?? 999999;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      });
      
      console.log("Formatted complement items:", sortedItems);
      setGroupComplements(sortedItems);
      return sortedItems;
    } catch (error: any) {
      console.error("Error fetching group complements:", error);
      toast.error("Erro ao carregar complementos do grupo");
      setGroupComplements([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    groupComplements,
    fetchComplementsByGroup
  };
};
