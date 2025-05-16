
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ComplementGroup, ProductComplementGroup } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export interface UseBasicGroupActionsProps {
  productId?: number;
  selectedGroups: ProductComplementGroup[];
  availableGroups: ComplementGroup[];
  setSelectedGroups: (groups: ProductComplementGroup[]) => void;
}

export const useBasicGroupActions = ({
  productId,
  selectedGroups,
  setSelectedGroups,
}: UseBasicGroupActionsProps) => {
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
      const { data, error } = await supabase
        .from("product_complement_groups")
        .insert({
          product_id: productId,
          complement_group_id: groupId,
          is_required: isRequired
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

  return {
    addGroupToProduct,
    removeGroupFromProduct,
    updateGroupRequiredStatus,
  };
};
