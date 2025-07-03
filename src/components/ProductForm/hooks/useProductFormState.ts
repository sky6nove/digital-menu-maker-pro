
import { useState, useEffect } from "react";
import { Product, ProductSize } from "@/types";

export const useProductFormState = (product?: Product) => {
  const [formData, setFormData] = useState<Omit<Product, "id"> | Product>({
    id: product?.id || 0,
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    categoryId: product?.categoryId || 1,
    isActive: product?.isActive !== undefined ? product.isActive : true,
    image_url: product?.image_url || "",
    allow_half_half: product?.allow_half_half || false,
    half_half_price_rule: product?.half_half_price_rule || "highest",
    hasStockControl: product?.hasStockControl || false,
    stockQuantity: product?.stockQuantity || 0,
  });

  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [complements, setComplements] = useState<number[]>([]);
  const [complementGroups, setComplementGroups] = useState<number[]>([]);

  // Update form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        categoryId: product.categoryId,
        isActive: product.isActive,
        image_url: product.image_url || "",
        allow_half_half: product.allow_half_half || false,
        half_half_price_rule: product.half_half_price_rule || "highest",
        hasStockControl: product.hasStockControl || false,
        stockQuantity: product.stockQuantity || 0,
      });
    }
  }, [product]);

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleSizeChange = (newSizes: ProductSize[]) => {
    setSizes(newSizes);
  };

  const handleComplementsChange = (newComplements: number[]) => {
    setComplements(newComplements);
  };

  const handleComplementGroupsChange = (newGroups: number[]) => {
    setComplementGroups(newGroups);
  };

  return {
    formData,
    setFormData,
    sizes,
    setSizes,
    complements,
    setComplements,
    complementGroups,
    setComplementGroups,
    handleBasicInfoChange,
    handleImageUpload,
    handleSizeChange,
    handleComplementsChange,
    handleComplementGroupsChange
  };
};
