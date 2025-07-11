
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useProductComplementGroups = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [productComplementGroups, setProductComplementGroups] = useState<any[]>([]);

  const fetchComplementGroupsByProduct = useCallback(async (productId: number) => {
    if (!productId) {
      console.error("No product ID provided");
      return [];
    }
    
    try {
      setLoading(true);
      console.log("Fetching complement groups for product ID:", productId);
      
      const { data, error } = await supabase
        .from("product_complement_groups")
        .select(`
          id,
          complement_group_id,
          "order",
          is_required,
          complement_groups:complement_group_id(
            id, 
            name, 
            is_active, 
            group_type, 
            minimum_quantity, 
            maximum_quantity, 
            is_required
          )
        `)
        .eq("product_id", productId)
        .order('order', { ascending: true, nullsFirst: false });
        
      if (error) {
        console.error("Error fetching product complement groups:", error);
        throw error;
      }
      
      console.log("Product complement groups data:", data);
      
      const formattedGroups = data ? data.map(item => ({
        id: item.complement_group_id,
        productGroupId: item.id,
        name: item.complement_groups?.name || 'Unnamed Group',
        isActive: item.complement_groups?.is_active !== false,
        order: item.order ?? 999999,
        isRequired: item.is_required,
        groupType: item.complement_groups?.group_type,
        minimumQuantity: item.complement_groups?.minimum_quantity,
        maximumQuantity: item.complement_groups?.maximum_quantity
      })) : [];
      
      const sortedGroups = [...formattedGroups].sort((a, b) => {
        if (a.order !== null && b.order !== null) {
          return a.order - b.order;
        }
        if (a.order === null) return 1;
        if (b.order === null) return -1;
        return a.name.localeCompare(b.name);
      });
      
      console.log("Formatted product complement groups:", sortedGroups);
      setProductComplementGroups(sortedGroups);
      return sortedGroups;
    } catch (error: any) {
      toast.error("Erro ao carregar grupos de complementos do produto");
      console.error("Error fetching product complement groups:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    productComplementGroups,
    fetchComplementGroupsByProduct
  };
};
