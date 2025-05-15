
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ComplementGroup } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export const useAvailableGroups = () => {
  const { user } = useAuth();
  const [availableGroups, setAvailableGroups] = useState<ComplementGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAvailableGroups = async () => {
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

  const updateAvailableGroups = (updatedGroups: ComplementGroup[]) => {
    setAvailableGroups(updatedGroups);
  };

  useEffect(() => {
    if (user) {
      loadAvailableGroups();
    }
  }, [user]);

  return {
    availableGroups,
    setAvailableGroups: updateAvailableGroups,
    loadAvailableGroups,
    loading
  };
};
