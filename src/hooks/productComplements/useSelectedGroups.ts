
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductComplementGroup } from "@/types";

export const useSelectedGroups = (productId?: number) => {
  const [selectedGroups, setSelectedGroups] = useState<ProductComplementGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSelectedGroups = async () => {
    if (!productId) {
      setSelectedGroups([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const { data: productGroupsData, error: productGroupsError } = await supabase
        .from("product_complement_groups")
        .select(`
          *,
          complement_groups:complement_group_id(*)
        `)
        .eq("product_id", productId);
        
      if (productGroupsError) throw productGroupsError;
      
      if (productGroupsData) {
        const formattedProductGroups: ProductComplementGroup[] = productGroupsData.map(pg => {
          const groupDetails = pg.complement_groups as any;
          
          return {
            id: pg.id,
            productId: pg.product_id,
            complementGroupId: pg.complement_group_id,
            isRequired: pg.is_required !== null ? pg.is_required : (groupDetails?.is_required || false)
          };
        });
        
        setSelectedGroups(formattedProductGroups);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar grupos de complementos do produto",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error loading product complement groups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSelectedGroups();
  }, [productId]);

  return {
    selectedGroups,
    setSelectedGroups,
    loadSelectedGroups
  };
};
