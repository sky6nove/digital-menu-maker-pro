
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ComplementGroup } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export interface UseGroupConfigurationProps {
  availableGroups: ComplementGroup[];
  setAvailableGroups: (groups: ComplementGroup[]) => void;
}

export const useGroupConfiguration = ({
  availableGroups,
  setAvailableGroups,
}: UseGroupConfigurationProps) => {
  const { user } = useAuth();

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
      
      // Update the local state
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
      
      // Update the local state
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

  return {
    updateGroupMinMax,
    toggleGroupActive,
  };
};
