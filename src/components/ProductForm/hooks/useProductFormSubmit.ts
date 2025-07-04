
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
    
    console.log("useProductFormSubmit: Submitting product data:", {
      ...formData,
      image_url: formData.image_url
    });
    
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
      // Log the image URL being submitted
      if (formData.image_url) {
        console.log("useProductFormSubmit: Submitting with image URL:", formData.image_url);
      } else {
        console.log("useProductFormSubmit: No image URL provided");
      }
      
      // Ensure the image_url is properly included in the form data
      const productDataWithImage = {
        ...formData,
        image_url: formData.image_url || null // Explicitly set to null if empty
      };
      
      console.log("useProductFormSubmit: Final product data before submission:", productDataWithImage);
      
      await onSubmit(productDataWithImage);
      
      toast({
        title: "Sucesso",
        description: product?.id ? "Produto atualizado com sucesso" : "Produto criado com sucesso",
      });
      
    } catch (error) {
      console.error("useProductFormSubmit: Error saving product:", error);
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
