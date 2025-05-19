
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProductMenuComplements = (productId?: number) => {
  const [loading, setLoading] = useState(false);
  const [complements, setComplements] = useState<any[]>([]);
  const [productComplementGroups, setProductComplementGroups] = useState<any[]>([]);

  // Fetch product complement groups
  const fetchProductComplementGroups = async (productId?: number) => {
    if (!productId) return [];
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("product_complement_groups")
        .select(`
          id,
          complement_group_id,
          is_required,
          complement_groups:complement_group_id(
            id,
            name,
            is_active,
            minimum_quantity,
            maximum_quantity
          )
        `)
        .eq("product_id", productId)
        .order('id');
        
      if (error) throw error;
      
      // Transform the data for easier use
      const formattedGroups = data.map(item => ({
        id: item.id,
        group: {
          id: item.complement_groups.id,
          name: item.complement_groups.name,
          minimumQuantity: item.complement_groups.minimum_quantity || 0,
          maximumQuantity: item.complement_groups.maximum_quantity || 0,
          isActive: item.complement_groups.is_active
        },
        isRequired: item.is_required || false
      }));
      
      setProductComplementGroups(formattedGroups);
      return formattedGroups;
    } catch (error) {
      console.error("Error fetching product complement groups:", error);
      toast.error("Erro ao carregar grupos de complementos");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch complements for a specific group
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

  // Fetch product complement groups when productId changes
  useEffect(() => {
    if (productId) {
      fetchProductComplementGroups(productId);
    } else {
      setProductComplementGroups([]);
    }
  }, [productId]);

  return {
    loading,
    complements,
    productComplementGroups,
    fetchComplementsForGroup,
    fetchProductComplementGroups
  };
};
