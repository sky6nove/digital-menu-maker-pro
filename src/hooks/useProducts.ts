import { useState } from "react";
import { Product, ProductSize } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProducts = (userId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(undefined);

  const loadProducts = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order("display_order", { ascending: true, nullsFirst: false }); // Fix: use nullsFirst instead of nullsLast
      
      if (productsError) throw productsError;
      
      // Transform to match our existing interfaces
      const formattedProducts: Product[] = productsData.map(prod => ({
        id: prod.id,
        name: prod.name,
        description: prod.description || "",
        price: prod.price,
        categoryId: prod.category_id || 0,
        isActive: prod.is_active,
        image_url: prod.image_url || "",
        allow_half_half: prod.allow_half_half || false,
        half_half_price_rule: prod.half_half_price_rule as 'lowest' | 'highest' | 'average' || 'highest',
        hasStockControl: prod.has_stock_control || false,
        stockQuantity: prod.stock_quantity || 0,
        display_order: prod.display_order || null
      }));
      
      setProducts(formattedProducts);
    } catch (error: any) {
      toast.error("Erro ao carregar produtos");
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
          
        if (error) throw error;
        toast.success("Produto excluído com sucesso");
        loadProducts();
      } catch (error: any) {
        toast.error("Erro ao excluir produto");
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleSubmitProduct = async (productData: Omit<Product, "id"> | Product, sizes?: ProductSize[]): Promise<Product | undefined> => {
    try {
      console.log("🔄 useProducts: Iniciando salvamento do produto:", {
        hasId: "id" in productData,
        productId: "id" in productData ? productData.id : "novo",
        name: productData.name,
        image_url: productData.image_url,
        imageUrlType: typeof productData.image_url,
        imageUrlLength: productData.image_url?.length || 0
      });

      if ("id" in productData && productData.id > 0) {
        // Update existing product
        console.log("📝 useProducts: Atualizando produto existente ID:", productData.id);
        
        // Prepare update data with proper image URL handling
        const updateData = {
          name: productData.name,
          description: productData.description || null,
          price: productData.price,
          category_id: productData.categoryId || null,
          is_active: productData.isActive,
          image_url: productData.image_url && productData.image_url.trim() !== '' ? productData.image_url.trim() : null,
          allow_half_half: productData.allow_half_half || false,
          half_half_price_rule: productData.half_half_price_rule || 'highest',
          has_stock_control: productData.hasStockControl || false,
          stock_quantity: productData.stockQuantity || 0,
          updated_at: new Date().toISOString()
        };

        console.log("💾 useProducts: Dados para atualização:", updateData);
        
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
        
        // Update or insert sizes if provided
        if (sizes && sizes.length > 0) {
          // First delete existing sizes
          const { error: deleteSizesError } = await supabase
            .from('product_sizes')
            .delete()
            .eq('product_id', productData.id);
            
          if (deleteSizesError) throw deleteSizesError;
          
          // Then insert new sizes
          const sizesToInsert = sizes.map(size => ({
            product_id: productData.id,
            name: size.name,
            price: size.price,
            is_default: size.is_default
          }));
          
          const { error: insertSizesError } = await supabase
            .from("product_sizes")
            .insert(sizesToInsert);
            
          if (insertSizesError) throw insertSizesError;
        }
        
        // Map database format to our interface
        const updatedProduct: Product = {
          id: data.id,
          name: data.name,
          description: data.description || "",
          price: data.price,
          categoryId: data.category_id || 0,
          isActive: data.is_active,
          image_url: data.image_url || "",
          allow_half_half: data.allow_half_half || false,
          half_half_price_rule: data.half_half_price_rule as 'lowest' | 'highest' | 'average' || 'highest',
          hasStockControl: data.has_stock_control || false,
          stockQuantity: data.stock_quantity || 0
        };
        
        loadProducts();
        return updatedProduct;
      } else {
        // Create new product
        console.log("➕ useProducts: Criando novo produto");
        
        // Prepare insert data with proper image URL handling
        const insertData = {
          name: productData.name,
          description: productData.description || null,
          price: productData.price,
          category_id: productData.categoryId || null,
          is_active: productData.isActive,
          image_url: productData.image_url && productData.image_url.trim() !== '' ? productData.image_url.trim() : null,
          allow_half_half: productData.allow_half_half || false,
          half_half_price_rule: productData.half_half_price_rule || 'highest',
          has_stock_control: productData.hasStockControl || false,
          stock_quantity: productData.stockQuantity || 0,
          user_id: userId
        };

        console.log("💾 useProducts: Dados para inserção:", insertData);
        
        const { data, error } = await supabase
          .from("products")
          .insert(insertData)
          .select()
          .single();
          
        if (error) {
          console.error("❌ useProducts: Erro ao criar produto:", error);
          throw error;
        }
        
        console.log("✅ useProducts: Produto criado com sucesso:", {
          id: data.id,
          name: data.name,
          image_url: data.image_url,
          savedImageUrl: data.image_url
        });
        
        // Insert sizes if provided
        if (sizes && sizes.length > 0) {
          const sizesToInsert = sizes.map(size => ({
            product_id: data.id,
            name: size.name,
            price: size.price,
            is_default: size.is_default
          }));
          
          const { error: insertSizesError } = await supabase
            .from("product_sizes")
            .insert(sizesToInsert);
            
          if (insertSizesError) throw insertSizesError;
        }
        
        // Map database format to our interface
        const newProduct: Product = {
          id: data.id,
          name: data.name,
          description: data.description || "",
          price: data.price,
          categoryId: data.category_id || 0,
          isActive: data.is_active,
          image_url: data.image_url || "",
          allow_half_half: data.allow_half_half || false,
          half_half_price_rule: data.half_half_price_rule as 'lowest' | 'highest' | 'average' || 'highest',
          hasStockControl: data.has_stock_control || false,
          stockQuantity: data.stock_quantity || 0
        };
        
        loadProducts();
        return newProduct;
      }
    } catch (error: any) {
      toast.error("Erro ao salvar produto");
      console.error("Error saving product:", error);
      return undefined;
    }
  };

  return {
    products,
    loading,
    currentProduct,
    loadProducts,
    handleDeleteProduct,
    handleSubmitProduct,
    setCurrentProduct
  };
};
