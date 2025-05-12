
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ComplementGroup } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export const useComplementGroups = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complementGroups, setComplementGroups] = useState<ComplementGroup[]>([]);

  const loadComplementGroups = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("complement_groups")
        .select("*")
        .eq("user_id", user?.id);
        
      if (error) throw error;
      
      // Transform to match our interface
      const formattedGroups: ComplementGroup[] = data.map(group => ({
        id: group.id,
        name: group.name,
        groupType: group.group_type as 'ingredients' | 'specifications' | 'cross_sell' | 'disposables',
        isActive: group.is_active,
        imageUrl: group.image_url || undefined,
        minimumQuantity: group.minimum_quantity || 0,
        maximumQuantity: group.maximum_quantity || 0,
        isRequired: group.is_required || false
      }));
      
      setComplementGroups(formattedGroups);
    } catch (error: any) {
      toast.error("Erro ao carregar grupos de complementos");
      console.error("Error loading complement groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este grupo?")) {
      try {
        const { error } = await supabase
          .from("complement_groups")
          .delete()
          .eq("id", id)
          .eq("user_id", user?.id);
          
        if (error) throw error;
        
        toast.success("Grupo excluído com sucesso");
        loadComplementGroups();
      } catch (error: any) {
        toast.error("Erro ao excluir grupo");
        console.error("Error deleting complement group:", error);
      }
    }
  };

  const handleSubmitGroup = async (groupData: Omit<ComplementGroup, "id"> | ComplementGroup) => {
    try {
      if ("id" in groupData && groupData.id > 0) {
        // Update existing group
        const { error } = await supabase
          .from("complement_groups")
          .update({
            name: groupData.name,
            group_type: groupData.groupType,
            is_active: groupData.isActive,
            image_url: groupData.imageUrl || null,
            minimum_quantity: groupData.minimumQuantity || 0,
            maximum_quantity: groupData.maximumQuantity || 0,
            is_required: groupData.isRequired || false,
            updated_at: new Date().toISOString()
          })
          .eq("id", groupData.id)
          .eq("user_id", user?.id);
          
        if (error) throw error;
        
        toast.success("Grupo atualizado com sucesso");
      } else {
        // Create new group
        const { error } = await supabase
          .from("complement_groups")
          .insert({
            name: groupData.name,
            group_type: groupData.groupType,
            is_active: groupData.isActive,
            image_url: groupData.imageUrl || null,
            minimum_quantity: groupData.minimumQuantity || 0,
            maximum_quantity: groupData.maximumQuantity || 0,
            is_required: groupData.isRequired || false,
            user_id: user?.id
          });
          
        if (error) throw error;
        
        toast.success("Grupo adicionado com sucesso");
      }
      
      loadComplementGroups();
      return true;
    } catch (error: any) {
      toast.error("Erro ao salvar grupo");
      console.error("Error saving complement group:", error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadComplementGroups();
    }
  }, [user]);

  return {
    loading,
    complementGroups,
    loadComplementGroups,
    handleDeleteGroup,
    handleSubmitGroup
  };
};
