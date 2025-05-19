
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ComplementGroup } from "@/types";

export const useProductComplementGroups = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [productComplementGroups, setProductComplementGroups] = useState<any[]>([]);

  const fetchComplementGroupsByProduct = async (productId: number) => {
    if (!productId) return [];
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("product_complement_groups")
        .select(`
          id,
          complement_group_id,
          "order",
          complement_groups:complement_group_id(*)
        `)
        .eq("product_id", productId)
        .order('order');
        
      if (error) throw error;
      
      // Format the data for easier use in the components
      const formattedGroups = data.map(item => ({
        id: item.complement_group_id,
        productGroupId: item.id,
        name: item.complement_groups?.name || 'Unnamed Group',
        isActive: item.complement_groups?.is_active || false,
        order: item.order
      }));
      
      setProductComplementGroups(formattedGroups);
      return formattedGroups;
    } catch (error: any) {
      toast.error("Erro ao carregar grupos de complementos do produto");
      console.error("Error fetching product complement groups:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    productComplementGroups,
    fetchComplementGroupsByProduct
  };
};
