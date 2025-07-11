import { Product } from "@/types";

export const transformProductFromDB = (prod: any): Product => ({
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
});

export const transformProductToDB = (productData: Omit<Product, "id"> | Product, userId?: string) => {
  const baseData = {
    name: productData.name,
    description: productData.description || null,
    price: productData.price,
    category_id: productData.categoryId || null,
    is_active: productData.isActive,
    image_url: productData.image_url && productData.image_url.trim() !== '' ? productData.image_url.trim() : null,
    allow_half_half: productData.allow_half_half || false,
    half_half_price_rule: productData.half_half_price_rule || 'highest',
    has_stock_control: productData.hasStockControl || false,
    stock_quantity: productData.stockQuantity || 0
  };

  if ("id" in productData && productData.id > 0) {
    return {
      ...baseData,
      updated_at: new Date().toISOString()
    };
  } else {
    return {
      ...baseData,
      user_id: userId
    };
  }
};