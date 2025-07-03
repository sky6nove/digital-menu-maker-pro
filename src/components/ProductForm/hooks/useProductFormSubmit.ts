
import { useState } from "react";
import { Product, ProductSize } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useProductFormSubmit = (
  formData: Omit<Product, "id"> | Product,
  sizes: ProductSize[],
  complements: number[],
  complementGroups: number[],
  onSubmit: (product: Omit<Product, "id"> | Product) => Promise<void>,
  product?: Product
) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (formData.price <= 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, insira um preço válido",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    loading
  };
};
