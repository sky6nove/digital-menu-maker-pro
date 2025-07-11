import { Product, ProductSize } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { transformProductFromDB, transformProductToDB } from "./productTransformers";

export const useProductOperations = () => {
  const loadProducts = async (userId?: string, setProducts?: (products: Product[]) => void, setLoading?: (loading: boolean) => void) => {
    if (!userId) return;
    
    try {
      setLoading?.(true);
      
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order("display_order", { ascending: true, nullsFirst: false });
      
      if (productsError) throw productsError;
      
      const formattedProducts: Product[] = productsData.map(transformProductFromDB);
      setProducts?.(formattedProducts);
    } catch (error: any) {
      toast.error("Erro ao carregar produtos");
      console.error("Error loading products:", error);
    } finally {
      setLoading?.(false);
    }
  };

  const handleDeleteProduct = async (id: number, userId?: string, onSuccess?: () => void) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
          
        if (error) throw error;
        toast.success("Produto excluído com sucesso");
        onSuccess?.();
      } catch (error: any) {
        toast.error("Erro ao excluir produto");
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleSizesOperation = async (productId: number, sizes?: ProductSize[], isUpdate: boolean = false) => {
    if (!sizes || sizes.length === 0) return;

    if (isUpdate) {
      // Delete existing sizes first
      const { error: deleteSizesError } = await supabase
        .from('product_sizes')
        .delete()
        .eq('product_id', productId);
        
      if (deleteSizesError) throw deleteSizesError;
    }
    
    // Insert new sizes
    const sizesToInsert = sizes.map(size => ({
      product_id: productId,
      name: size.name,
      price: size.price,
      is_default: size.is_default
    }));
    
    const { error: insertSizesError } = await supabase
      .from("product_sizes")
      .insert(sizesToInsert);
      
    if (insertSizesError) throw insertSizesError;
  };

  const handleSubmitProduct = async (
    productData: Omit<Product, "id"> | Product, 
    sizes?: ProductSize[], 
    userId?: string,
    onSuccess?: () => void
  ): Promise<Product | undefined> => {
    try {
      console.log("🔄 useProductOperations: Iniciando salvamento do produto:", {
        hasId: "id" in productData,
        productId: "id" in productData ? productData.id : "novo",
        name: productData.name,
        image_url: productData.image_url,
        imageUrlType: typeof productData.image_url,
        imageUrlLength: productData.image_url?.length || 0
      });

      if ("id" in productData && productData.id > 0) {
        // Update existing product
        console.log("📝 useProductOperations: Atualizando produto existente ID:", productData.id);
        
        const updateData = transformProductToDB(productData);
        console.log("💾 useProductOperations: Dados para atualização:", updateData);
        
        const { data, error } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", productData.id)
          .eq("user_id", userId)
          .select()
          .single();
          
        if (error) {
          console.error("Database error when updating product:", error);
          throw error;
        }
        
        await handleSizesOperation(productData.id, sizes, true);
        
        const updatedProduct = transformProductFromDB(data);
        onSuccess?.();
        return updatedProduct;
      } else {
        // Create new product
        console.log("➕ useProductOperations: Criando novo produto");
        
        const insertData = transformProductToDB(productData, userId);
        console.log("💾 useProductOperations: Dados para inserção:", insertData);
        
        const { data, error } = await supabase
          .from("products")
          .insert(insertData as any)
          .select()
          .single();
          
        if (error) {
          console.error("❌ useProductOperations: Erro ao criar produto:", error);
          throw error;
        }
        
        console.log("✅ useProductOperations: Produto criado com sucesso:", {
          id: data.id,
          name: data.name,
          image_url: data.image_url,
          savedImageUrl: data.image_url
        });
        
        await handleSizesOperation(data.id, sizes, false);
        
        const newProduct = transformProductFromDB(data);
        onSuccess?.();
        return newProduct;
      }
    } catch (error: any) {
      toast.error("Erro ao salvar produto");
      console.error("Error saving product:", error);
      return undefined;
    }
  };

  return {
    loadProducts,
    handleDeleteProduct,
    handleSubmitProduct
  };
};