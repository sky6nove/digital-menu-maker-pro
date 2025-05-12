
import { supabase } from "@/integrations/supabase/client";
import { ProductSize, Complement } from "@/types";

export const useDataHelpers = () => {
  // Get product sizes using RPC function
  const getProductSizes = async (productId: number): Promise<ProductSize[]> => {
    const { data, error } = await supabase
      .rpc('get_product_sizes', { product_id_param: productId });
      
    if (error) {
      console.error("Error fetching product sizes:", error);
      return [];
    }
    
    return data || [];
  };
  
  // Delete product sizes (for when updating a product)
  const deleteProductSizes = async (productId: number): Promise<boolean> => {
    // Using direct deletion from table instead of RPC function
    const { error } = await supabase
      .from('product_sizes')
      .delete()
      .eq('product_id', productId);
      
    if (error) {
      console.error("Error deleting product sizes:", error);
      return false;
    }
    
    return true;
  };
  
  // Get all active complements
  const getAllComplements = async (): Promise<Complement[]> => {
    const { data, error } = await supabase
      .rpc('get_all_complements');
      
    if (error) {
      console.error("Error fetching complements:", error);
      return [];
    }
    
    // Map the database fields to our interface structure
    const mappedComplements: Complement[] = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      isActive: item.is_active, // Map is_active to isActive
      hasStockControl: item.has_stock_control,
      stockQuantity: item.stock_quantity
    }));
    
    return mappedComplements;
  };
  
  // Get complements for a specific product
  const getProductComplements = async (productId: number): Promise<number[]> => {
    const { data, error } = await supabase
      .rpc('get_product_complements', { product_id_param: productId });
      
    if (error) {
      console.error("Error fetching product complements:", error);
      return [];
    }
    
    return (data || []).map(item => item.complement_id);
  };
  
  // Delete all complements for a product
  const deleteProductComplements = async (productId: number): Promise<boolean> => {
    const { error } = await supabase
      .rpc('delete_product_complements', { product_id_param: productId });
      
    if (error) {
      console.error("Error deleting product complements:", error);
      return false;
    }
    
    return true;
  };
  
  // Insert a product complement
  const insertProductComplement = async (productId: number, complementId: number, userId: string): Promise<boolean> => {
    const { error } = await supabase
      .rpc('insert_product_complement', { 
        product_id_param: productId,
        complement_id_param: complementId,
        user_id_param: userId
      });
      
    if (error) {
      console.error("Error inserting product complement:", error);
      return false;
    }
    
    return true;
  };

  return {
    getProductSizes,
    deleteProductSizes,
    getAllComplements,
    getProductComplements,
    deleteProductComplements,
    insertProductComplement
  };
};
