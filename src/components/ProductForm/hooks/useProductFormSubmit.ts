
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
    
    console.log("🚀 useProductFormSubmit: Iniciando submissão do produto:", {
      productName: formData.name,
      hasImageUrl: !!formData.image_url,
      imageUrl: formData.image_url,
      imageUrlType: typeof formData.image_url,
      imageUrlLength: formData.image_url?.length || 0,
      isEditing: !!product?.id
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
      // Prepare final product data with careful image URL handling
      const productDataWithImage = {
        ...formData,
        image_url: formData.image_url && formData.image_url.trim() !== '' ? formData.image_url.trim() : ""
      };
      
      console.log("📤 useProductFormSubmit: Enviando dados finais:", {
        name: productDataWithImage.name,
        image_url: productDataWithImage.image_url,
        imageUrlWillBeSaved: productDataWithImage.image_url !== null,
        allData: productDataWithImage
      });
      
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
