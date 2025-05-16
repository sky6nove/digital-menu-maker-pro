
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UseComplementActionsProps {
  productId?: number;
}

export const useComplementActions = ({
  productId
}: UseComplementActionsProps) => {
  const { user } = useAuth();

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

  const updateComplementPrice = async (complementId: number, newPrice: number) => {
    if (!productId || !user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "ID do produto ou usuário não fornecido",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // First check if there's an existing product-specific price
      const { data: existingData, error: existingError } = await supabase
        .from("product_specific_complements")
        .select("id")
        .eq("product_id", productId)
        .eq("complement_id", complementId)
        .single();
      
      if (existingError && existingError.code !== "PGRST116") {
        throw existingError;
      }
      
      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from("product_specific_complements")
          .update({ custom_price: newPrice })
          .eq("id", existingData.id);
        
        if (error) throw error;
      } else {
        // Get the complement to find its group_id
        const { data: complementData, error: complementError } = await supabase
          .from("complement_items")
          .select("group_id")
          .eq("id", complementId)
          .single();
          
        if (complementError) throw complementError;
        
        // Create new record
        const { error } = await supabase
          .from("product_specific_complements")
          .insert({
            product_id: productId,
            complement_id: complementId,
            complement_group_id: complementData.group_id,
            custom_price: newPrice,
            is_active: true,
            user_id: user.id
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Preço atualizado",
        description: `Preço atualizado para R$ ${newPrice.toFixed(2).replace('.', ',')}`,
        variant: "default",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar preço",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error updating complement price:", error);
      return false;
    }
  };

  return {
    toggleComplementActive,
    updateComplementPrice
  };
};
