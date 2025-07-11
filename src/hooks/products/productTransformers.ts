import { Product } from "@/types";

export const transformProductFromDB = (prod: any): Product => {
  console.log("🔄 transformProductFromDB: Transformando dados do DB:", {
    productId: prod.id,
    productName: prod.name,
    rawImageUrl: prod.image_url,
    imageUrlType: typeof prod.image_url,
    hasImageUrl: !!prod.image_url
  });

  const product = {
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
  };

  console.log("✅ transformProductFromDB: Produto transformado:", {
    productId: product.id,
    finalImageUrl: product.image_url,
    imageUrlPreserved: product.image_url === prod.image_url
  });

  return product;
};

export const transformProductToDB = (productData: Omit<Product, "id"> | Product, userId?: string) => {
  console.log("📤 transformProductToDB: Transformando dados para DB:", {
    productName: productData.name,
    originalImageUrl: productData.image_url,
    imageUrlType: typeof productData.image_url,
    imageUrlLength: productData.image_url?.length || 0,
    isEditing: "id" in productData && productData.id > 0
  });

  // Preserve valid image URLs, only set to null if truly empty
  const processedImageUrl = productData.image_url && productData.image_url.trim() !== '' 
    ? productData.image_url.trim() 
    : null;

  console.log("🔍 transformProductToDB: Processando image_url:", {
    original: productData.image_url,
    processed: processedImageUrl,
    willBeSaved: processedImageUrl !== null
  });

  const baseData = {
    name: productData.name,
    description: productData.description || null,
    price: productData.price,
    category_id: productData.categoryId || null,
    is_active: productData.isActive,
    image_url: processedImageUrl,
    allow_half_half: productData.allow_half_half || false,
    half_half_price_rule: productData.half_half_price_rule || 'highest',
    has_stock_control: productData.hasStockControl || false,
    stock_quantity: productData.stockQuantity || 0
  };

  console.log("✅ transformProductToDB: Dados finais para DB:", {
    image_url: baseData.image_url,
    imageUrlFinal: baseData.image_url
  });

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