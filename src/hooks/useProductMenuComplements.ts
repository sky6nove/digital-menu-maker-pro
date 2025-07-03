
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ComplementGroup, ComplementItem } from "@/types";

export interface ProductComplementData {
  groups: ComplementGroup[];
  complements: {[groupId: number]: ComplementItem[]};
}

export const useProductMenuComplements = (productId?: number) => {
  const { user } = useAuth();
  const [data, setData] = useState<ProductComplementData>({
    groups: [],
    complements: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !productId) {
      setData({ groups: [], complements: {} });
      return;
    }

    loadProductComplements();
  }, [user?.id, productId]);

  const loadProductComplements = async () => {
    if (!user?.id || !productId) return;

    try {
      setLoading(true);
      setError(null);

      // First, get the complement groups associated with this product
      const { data: productGroupsData, error: productGroupsError } = await supabase
        .from("product_complement_groups")
        .select(`
          id,
          complement_group_id,
          is_required,
          order
        `)
        .eq("product_id", productId)
        .order('order', { ascending: true });

      if (productGroupsError) {
        console.error("Error loading product complement groups:", productGroupsError);
        throw productGroupsError;
      }

      if (!productGroupsData || productGroupsData.length === 0) {
        console.log("No complement groups found for product:", productId);
        setData({ groups: [], complements: {} });
        return;
      }

      // Get the group IDs
      const groupIds = productGroupsData.map(pg => pg.complement_group_id);

      // Now get the actual groups data
      const { data: groupsData, error: groupsError } = await supabase
        .from("complement_groups")
        .select("*")
        .in("id", groupIds)
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (groupsError) {
        console.error("Error loading complement groups:", groupsError);
        throw groupsError;
      }

      // Transform groups data
      const groups: ComplementGroup[] = (groupsData || []).map(group => ({
        id: group.id,
        name: group.name,
        groupType: group.group_type as 'ingredients' | 'specifications' | 'cross_sell' | 'disposables',
        isActive: group.is_active,
        imageUrl: group.image_url,
        minimumQuantity: group.minimum_quantity,
        maximumQuantity: group.maximum_quantity,
        isRequired: productGroupsData.find(pg => pg.complement_group_id === group.id)?.is_required || false
      }));

      // Now load complement items for each group
      const complementsData: {[groupId: number]: ComplementItem[]} = {};

      for (const group of groups) {
        // First try to get product-specific complements
        const { data: specificComplements, error: specificError } = await supabase
          .from("product_specific_complements")
          .select(`
            id,
            complement_id,
            is_active,
            custom_price,
            order
          `)
          .eq("product_id", productId)
          .eq("complement_group_id", group.id)
          .eq("is_active", true)
          .order('order', { ascending: true });

        if (specificError) {
          console.error("Error loading product specific complements:", specificError);
        }

        if (specificComplements && specificComplements.length > 0) {
          // Get complement details for product-specific complements
          const complementIds = specificComplements.map(sc => sc.complement_id);
          
          const { data: complementDetails, error: complementDetailsError } = await supabase
            .from("complements")
            .select("*")
            .in("id", complementIds)
            .eq("is_active", true);

          if (!complementDetailsError && complementDetails) {
            complementsData[group.id] = complementDetails.map(comp => {
              const specificComp = specificComplements.find(sc => sc.complement_id === comp.id);
              return {
                id: comp.id,
                groupId: group.id,
                name: comp.name,
                price: specificComp?.custom_price !== null ? specificComp.custom_price : comp.price,
                isActive: true,
                quantity: 0,
                groupName: group.name
              };
            });
          }
        } else {
          // If no product-specific complements, get complement items from the group
          const { data: complementItems, error: complementItemsError } = await supabase
            .from("complement_items")
            .select("*")
            .eq("group_id", group.id)
            .eq("is_active", true)
            .order('order', { ascending: true });

          if (!complementItemsError && complementItems) {
            complementsData[group.id] = complementItems.map(item => ({
              id: item.id,
              groupId: group.id,
              name: item.name,
              price: item.price || 0,
              isActive: item.is_active,
              quantity: 0,
              groupName: group.name
            }));
          }
        }
      }

      console.log("Loaded complement data:", { groups, complementsData });
      setData({ groups, complements: complementsData });

    } catch (error: any) {
      console.error("Error in loadProductComplements:", error);
      setError(error.message || "Erro ao carregar complementos");
      setData({ groups: [], complements: {} });
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: loadProductComplements };
};
