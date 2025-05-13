
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductComplementGroup, ComplementGroup, ComplementItem } from "@/types";
import { toast } from "sonner";

export const useProductMenuComplements = (productId?: number) => {
  const [loading, setLoading] = useState(false);
  const [productComplementGroups, setProductComplementGroups] = useState<{
    group: ComplementGroup;
    complements: ComplementItem[];
    isRequired: boolean;
  }[]>([]);

  const fetchProductComplementGroups = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      
      // Get all complement groups for this product
      const { data: groupsData, error: groupsError } = await supabase
        .from("product_complement_groups")
        .select(`
          id,
          is_required,
          complement_group_id,
          complement_groups:complement_group_id(*)
        `)
        .eq("product_id", productId);
      
      if (groupsError) throw groupsError;
      
      if (!groupsData || groupsData.length === 0) {
        setProductComplementGroups([]);
        return;
      }
      
      // Create an array to hold all complement groups with their items
      const complementGroups = await Promise.all(
        groupsData.map(async (groupData) => {
          const group = groupData.complement_groups as unknown as ComplementGroup;
          const isRequired = groupData.is_required || false;
          
          // First check if there are product-specific complements for this group
          const { data: specificComplements, error: specificError } = await supabase
            .rpc("get_product_specific_complements", {
              product_id_param: productId,
              group_id_param: group.id
            });
          
          if (specificError && specificError.message !== 'No rows returned from the query.') {
            console.error("Error fetching specific complements:", specificError);
            // On error, try to fetch all complements for this group
            const { data: allComplements, error: allError } = await supabase
              .from("complements")
              .select("*")
              .eq("is_active", true);
              
            if (allError) throw allError;
            
            const complements: ComplementItem[] = (allComplements || []).map(c => ({
              id: c.id,
              groupId: group.id,
              name: c.name,
              price: c.price,
              isActive: c.is_active
            }));
            
            return { group, complements, isRequired };
          }
          
          // If we have specific complements, use them
          if (specificComplements && specificComplements.length > 0) {
            const complements: ComplementItem[] = specificComplements
              .filter(c => c.is_active)
              .map(c => ({
                id: c.complement_id,
                groupId: group.id,
                name: c.complement_name,
                price: c.custom_price || c.complement_default_price,
                isActive: c.is_active,
                customPrice: c.custom_price
              }));
            
            return { group, complements, isRequired };
          } else {
            // No specific complements found, get all active complements
            const { data: allComplements, error: allError } = await supabase
              .from("complements")
              .select("*")
              .eq("is_active", true);
              
            if (allError) throw allError;
            
            const complements: ComplementItem[] = (allComplements || []).map(c => ({
              id: c.id,
              groupId: group.id,
              name: c.name,
              price: c.price,
              isActive: c.is_active
            }));
            
            return { group, complements, isRequired };
          }
        })
      );
      
      setProductComplementGroups(complementGroups);
    } catch (error) {
      console.error("Error fetching product complement groups:", error);
      toast.error("Erro ao carregar complementos do produto");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductComplementGroups();
    }
  }, [productId]);

  return {
    loading,
    productComplementGroups,
    fetchProductComplementGroups
  };
};
