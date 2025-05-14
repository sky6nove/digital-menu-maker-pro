
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ComplementGroup, ProductComplementGroup } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export const useProductComplementGroups = (productId?: number) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableGroups, setAvailableGroups] = useState<ComplementGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<ProductComplementGroup[]>([]);

  const loadComplementGroups = async () => {
    try {
      setLoading(true);
      
      // Load all available complement groups with complete information
      const { data: groupsData, error: groupsError } = await supabase
        .from("complement_groups")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true);
        
      if (groupsError) throw groupsError;
      
      // Transform to match our interface
      const formattedGroups: ComplementGroup[] = groupsData.map(group => ({
        id: group.id,
        name: group.name,
        groupType: group.group_type as 'ingredients' | 'specifications' | 'cross_sell' | 'disposables',
        isActive: group.is_active,
        imageUrl: group.image_url || undefined,
        minimumQuantity: group.minimum_quantity || 0,
        maximumQuantity: group.maximum_quantity || 0,
        isRequired: group.is_required || false
      }));
      
      setAvailableGroups(formattedGroups);
      
      // If we have a product ID, load the selected groups for this product
      if (productId) {
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
              // If is_required is explicitly set in the product_complement_groups record, use that
              // Otherwise, default to the group's isRequired property
              isRequired: pg.is_required !== null ? pg.is_required : (groupDetails?.is_required || false)
            };
          });
          
          setSelectedGroups(formattedProductGroups);
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar grupos de complementos",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error loading complement groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const addGroupToProduct = async (groupId: number, isRequired: boolean) => {
    if (!productId || !user?.id) {
      toast({
        title: "Produto não especificado",
        description: "ID do produto não fornecido",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get the default isRequired value from the group
      const selectedGroup = availableGroups.find(g => g.id === groupId);
      
      // Use the provided isRequired value or default to the group's setting
      const finalIsRequired = isRequired !== undefined ? isRequired : (selectedGroup?.isRequired || false);
      
      const { data, error } = await supabase
        .from("product_complement_groups")
        .insert({
          product_id: productId,
          complement_group_id: groupId,
          is_required: finalIsRequired
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newGroup: ProductComplementGroup = {
        id: data.id,
        productId: data.product_id,
        complementGroupId: data.complement_group_id,
        isRequired: data.is_required
      };
      
      setSelectedGroups([...selectedGroups, newGroup]);
      toast({
        title: "Grupo adicionado ao produto",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar grupo ao produto",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error adding group to product:", error);
    }
  };

  const removeGroupFromProduct = async (groupId: number) => {
    if (!productId) {
      toast({
        title: "Produto não especificado",
        description: "ID do produto não fornecido",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const groupToRemove = selectedGroups.find(g => g.complementGroupId === groupId);
      
      if (!groupToRemove) {
        toast({
          title: "Grupo não encontrado",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from("product_complement_groups")
        .delete()
        .eq("id", groupToRemove.id);
        
      if (error) throw error;
      
      setSelectedGroups(selectedGroups.filter(g => g.complementGroupId !== groupId));
      toast({
        title: "Grupo removido do produto",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover grupo do produto",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error removing group from product:", error);
    }
  };

  const updateGroupRequiredStatus = async (groupId: number, isRequired: boolean) => {
    if (!productId) {
      toast({
        title: "Produto não especificado",
        description: "ID do produto não fornecido",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const groupToUpdate = selectedGroups.find(g => g.complementGroupId === groupId);
      
      if (!groupToUpdate) {
        toast({
          title: "Grupo não encontrado",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from("product_complement_groups")
        .update({ is_required: isRequired })
        .eq("id", groupToUpdate.id);
        
      if (error) throw error;
      
      setSelectedGroups(selectedGroups.map(g => 
        g.complementGroupId === groupId ? { ...g, isRequired } : g
      ));
      
      toast({
        title: "Status atualizado",
        description: `Grupo ${isRequired ? "obrigatório" : "opcional"}`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar grupo",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error updating group:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadComplementGroups();
    }
  }, [user, productId]);

  return {
    loading,
    availableGroups,
    selectedGroups,
    loadComplementGroups,
    addGroupToProduct,
    removeGroupFromProduct,
    updateGroupRequiredStatus
  };
};
