
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
        .order('order');
        
      if (error) {
        console.error("Error fetching product complement groups:", error);
        throw error;
      }
      
      console.log("Product complement groups data:", data);
      
      // Format the data for easier use in the components
      const formattedGroups = data ? data.map(item => ({
        id: item.complement_group_id, // This is the actual complement group ID
        productGroupId: item.id, // This is the product_complement_groups junction table ID
        name: item.complement_groups?.name || 'Unnamed Group',
        isActive: item.complement_groups?.is_active !== false,
        order: item.order || 0,
        isRequired: item.is_required,
        groupType: item.complement_groups?.group_type,
        minimumQuantity: item.complement_groups?.minimum_quantity,
        maximumQuantity: item.complement_groups?.maximum_quantity
      })) : [];
      
      console.log("Formatted product complement groups:", formattedGroups);
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
