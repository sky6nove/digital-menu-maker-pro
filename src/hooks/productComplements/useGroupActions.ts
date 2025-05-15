import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ComplementGroup, ProductComplementGroup } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export interface UseGroupActionsProps {
  productId?: number;
  selectedGroups: ProductComplementGroup[];
  availableGroups: ComplementGroup[];
  setSelectedGroups: (groups: ProductComplementGroup[]) => void;
  setAvailableGroups: (groups: ComplementGroup[]) => void;
}

export const useGroupActions = ({
  productId,
  selectedGroups,
  availableGroups,
  setSelectedGroups,
  setAvailableGroups
}: UseGroupActionsProps) => {
  const { user } = useAuth();

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

  const updateGroupMinMax = async (groupId: number, minQuantity: number, maxQuantity: number) => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Update the group in the database
      const { error } = await supabase
        .from("complement_groups")
        .update({ 
          minimum_quantity: minQuantity,
          maximum_quantity: maxQuantity
        })
        .eq("id", groupId)
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      // Update the local state - fix the type issue by creating a new array
      setAvailableGroups(availableGroups.map(group => 
        group.id === groupId 
          ? { 
              ...group, 
              minimumQuantity: minQuantity,
              maximumQuantity: maxQuantity
            } 
          : group
      ));
      
      toast({
        title: "Quantidades atualizadas",
        description: `Min: ${minQuantity}, Max: ${maxQuantity}`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar quantidades",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error updating min/max quantities:", error);
    }
  };

  const toggleGroupActive = async (groupId: number, isActive: boolean) => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Update the group in the database
      const { error } = await supabase
        .from("complement_groups")
        .update({ is_active: isActive })
        .eq("id", groupId)
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      // Update the local state - fix the type issue by creating a new array
      setAvailableGroups(availableGroups.map(group => 
        group.id === groupId 
          ? { ...group, isActive } 
          : group
      ));
      
      toast({
        title: "Status do grupo atualizado",
        description: `Grupo ${isActive ? "ativado" : "desativado"}`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status do grupo",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error toggling group active state:", error);
    }
  };

  const toggleComplementActive = async (complementId: number, isActive: boolean) => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Update the complement in the database
      const { error } = await supabase
        .from("complement_items")
        .update({ is_active: isActive })
        .eq("id", complementId);
        
      if (error) throw error;
      
      toast({
        title: "Status do complemento atualizado",
        description: `Complemento ${isActive ? "ativado" : "desativado"}`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status do complemento",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error toggling complement active state:", error);
    }
  };

  return {
    addGroupToProduct,
    removeGroupFromProduct,
    updateGroupRequiredStatus,
    updateGroupMinMax,
    toggleGroupActive,
    toggleComplementActive
  };
};
