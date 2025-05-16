
import { useState } from "react";
import { ComplementItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useComplementItems = (groupId: number) => {
  const { toast } = useToast();
  const [complementItems, setComplementItems] = useState<ComplementItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComplementsForGroup = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("complement_items")
        .select("*")
        .eq("group_id", groupId);
        
      if (error) throw error;
      
      // Transform to match our interface
      const formattedItems: ComplementItem[] = data.map(item => ({
        id: item.id,
        groupId: item.group_id,
        name: item.name,
        price: item.price || 0,
        isActive: item.is_active,
        productId: item.product_id || undefined
      }));
      
      setComplementItems(formattedItems);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar complementos",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error loading complements:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateLocalComplementStatus = (complementId: number, isActive: boolean) => {
    setComplementItems(items => 
      items.map(item => 
        item.id === complementId 
          ? { ...item, isActive } 
          : item
      )
    );
  };

  return {
    complementItems,
    loading,
    loadComplementsForGroup,
    updateLocalComplementStatus
  };
};
