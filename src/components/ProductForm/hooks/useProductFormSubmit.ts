
import { FormEvent } from "react";
import { Product, ProductSize } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface UseProductFormSubmitProps {
  formData: Omit<Product, "id"> | Product;
  hasMultipleSizes: boolean;
  sizes: ProductSize[];
  selectedComplements: number[];
  toast: any;
  onSubmit: (product: Omit<Product, "id"> | Product, sizes?: ProductSize[]) => Promise<Product | undefined>;
}

export const useProductFormSubmit = ({
  formData,
  hasMultipleSizes,
  sizes,
  selectedComplements,
  toast,
  onSubmit
}: UseProductFormSubmitProps) => {
  const { user } = useAuth();
  
  const loadComplements = async () => {
    if (!user?.id) return;
    
    try {
      // Load all available complements using rpc
      const { data: complementsData, error: complementsError } = await supabase
        .rpc('get_all_complements');
        
      if (complementsError) throw complementsError;
      
      if (complementsData) {
        // Map the data to match our Complement interface
        const formattedComplements = complementsData.map((comp: any) => ({
          id: comp.id,
          name: comp.name,
          price: comp.price,
          image_url: comp.image_url,
          isActive: comp.is_active,
          hasStockControl: comp.has_stock_control,
          stockQuantity: comp.stock_quantity
        }));
        
        return formattedComplements;
      }
      
      if (!('id' in formData) || formData.id === 0) return [];
      
      // Load selected complements for this product
      const { data: productComplementsData, error: productComplementsError } = await supabase
        .rpc('get_product_complements', { product_id_param: formData.id });
        
      if (productComplementsError) throw productComplementsError;
      
      if (productComplementsData) {
        return productComplementsData.map((pc: any) => pc.complement_id);
      }
      
      return [];
    } catch (error: any) {
      console.error("Error loading complements:", error);
      toast({
        title: "Erro ao carregar complementos",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para o produto",
        variant: "destructive",
      });
      return;
    }

    if (!hasMultipleSizes && formData.price <= 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, insira um preço válido",
        variant: "destructive",
      });
      return;
    }

    if (hasMultipleSizes) {
      if (sizes.length === 0) {
        toast({
          title: "Tamanhos obrigatórios",
          description: "Por favor, adicione pelo menos um tamanho",
          variant: "destructive",
        });
        return;
      }
      
      for (const size of sizes) {
        if (!size.name.trim()) {
          toast({
            title: "Nome do tamanho obrigatório",
            description: "Por favor, insira um nome para todos os tamanhos",
            variant: "destructive",
          });
          return;
        }
        
        if (size.price <= 0) {
          toast({
            title: "Preço do tamanho inválido",
            description: "Por favor, insira um preço válido para todos os tamanhos",
            variant: "destructive",
          });
          return;
        }
      }
      
      if (!sizes.some(s => s.is_default)) {
        toast({
          title: "Tamanho padrão obrigatório",
          description: "Por favor, defina um tamanho como padrão",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      // Submit the product data
      const productResult = await onSubmit(formData, hasMultipleSizes ? sizes : undefined);
      
      // If product was created/updated successfully and we have product ID
      if (productResult) {
        const productId = productResult.id;
        
        // Update product complements
        await updateProductComplements(productId);
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };
  
  const updateProductComplements = async (productId: number) => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Use RPC function instead of direct table access
      await supabase.rpc('delete_product_complements', { product_id_param: productId });
      
      // Then create new relationships for selected complements
      if (selectedComplements.length > 0) {
        // Use RPC to insert product complements
        for (const complementId of selectedComplements) {
          await supabase.rpc('insert_product_complement', { 
            product_id_param: productId,
            complement_id_param: complementId,
            user_id_param: user.id
          });
        }
      }
    } catch (error: any) {
      console.error("Error updating product complements:", error);
      toast({
        title: "Erro ao atualizar complementos",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  return {
    handleSubmit,
    loadComplements,
    updateProductComplements
  };
};
