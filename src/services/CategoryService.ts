
import { Category } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CategoryService = {
  /**
   * Fetches all categories for a user
   */
  getCategories: async (userId: string): Promise<Category[]> => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId);
      
      if (categoriesError) throw categoriesError;
      
      // Transform to match our existing interfaces
      const formattedCategories: Category[] = categoriesData.map(cat => ({
        id: cat.id,
        name: cat.name,
        isActive: cat.is_active,
        order: cat.order || 0,
        // Safely handle potentially missing database columns
        allowHalfHalf: cat.allow_half_half === true,
        halfHalfPriceRule: (cat.half_half_price_rule as 'lowest' | 'highest' | 'average') || 'highest'
      }));
      
      // Sort by order
      formattedCategories.sort((a, b) => a.order - b.order);
      
      return formattedCategories;
    } catch (error: any) {
      console.error("Error loading categories:", error);
      throw error;
    }
  },

  /**
   * Updates an existing category
   */
  updateCategory: async (userId: string, categoryData: Category): Promise<void> => {
    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: categoryData.name,
          is_active: categoryData.isActive,
          order: categoryData.order,
          allow_half_half: categoryData.allowHalfHalf === true ? true : null,
          half_half_price_rule: categoryData.halfHalfPriceRule || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", categoryData.id)
        .eq("user_id", userId);
        
      if (error) throw error;
    } catch (error: any) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  /**
   * Creates a new category
   */
  createCategory: async (
    userId: string, 
    categoryData: Omit<Category, "id">, 
    maxOrder: number
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from("categories")
        .insert({
          name: categoryData.name,
          is_active: categoryData.isActive,
          order: maxOrder,
          allow_half_half: categoryData.allowHalfHalf === true ? true : null,
          half_half_price_rule: categoryData.halfHalfPriceRule || null,
          user_id: userId
        });
        
      if (error) throw error;
    } catch (error: any) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  /**
   * Deletes a category
   */
  deleteCategory: async (userId: string, categoryId: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId)
        .eq("user_id", userId);
        
      if (error) throw error;
    } catch (error: any) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  /**
   * Updates the order of a category
   */
  updateCategoryOrder: async (
    userId: string, 
    categoryId: number, 
    newOrder: number
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from("categories")
        .update({ 
          order: newOrder  // Update the order field
        })
        .eq("id", categoryId)
        .eq("user_id", userId);
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Error updating category order:", error);
      throw error;
    }
  },

  /**
   * Swaps the order of two categories
   */
  swapCategoriesOrder: async (
    userId: string, 
    category1Id: number, 
    category1Order: number,
    category2Id: number,
    category2Order: number
  ): Promise<void> => {
    try {
      await Promise.all([
        supabase
          .from("categories")
          .update({ order: category2Order })  // Update first category's order
          .eq("id", category1Id)
          .eq("user_id", userId),
          
        supabase
          .from("categories")
          .update({ order: category1Order })  // Update second category's order
          .eq("id", category2Id)
          .eq("user_id", userId)
      ]);
    } catch (error: any) {
      console.error("Error swapping categories order:", error);
      throw error;
    }
  }
};

export default CategoryService;
