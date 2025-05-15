
import { useState, useEffect } from "react";
import { Product, Category, ProductSize, Complement } from "@/types";

export const useProductFormState = (product?: Product, categories: Category[] = []) => {
  const initialCategoryId = product?.categoryId || (categories.length > 0 ? categories[0].id : 0);
  
  const [formData, setFormData] = useState<Omit<Product, "id"> | Product>({
    id: product?.id || 0,
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    categoryId: product?.categoryId || initialCategoryId,
    isActive: product?.isActive !== undefined ? product.isActive : true,
    image_url: product?.image_url || "",
    allow_half_half: product?.allow_half_half || false,
    half_half_price_rule: product?.half_half_price_rule || "highest",
    hasStockControl: product?.hasStockControl || false,
    stockQuantity: product?.stockQuantity || 0,
  });
  
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [hasMultipleSizes, setHasMultipleSizes] = useState(false);
  const [availableComplements, setAvailableComplements] = useState<Complement[]>([]);
  const [selectedComplements, setSelectedComplements] = useState<number[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and up to one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setFormData({ ...formData, price: value === "" ? 0 : parseFloat(value) });
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, categoryId: parseInt(value) });
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData({ ...formData, isActive: checked });
  };

  const handleHalfHalfChange = (checked: boolean) => {
    setFormData({ ...formData, allow_half_half: checked });
  };

  const handleHalfHalfPriceRuleChange = (value: string) => {
    setFormData({
      ...formData,
      half_half_price_rule: value as 'lowest' | 'highest' | 'average'
    });
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, image_url: url });
  };

  const handleHasStockControlChange = (checked: boolean) => {
    setFormData({ ...formData, hasStockControl: checked });
  };

  const handleStockQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setFormData({ ...formData, stockQuantity: value });
    }
  };

  const handleMultipleSizesChange = (checked: boolean) => {
    setHasMultipleSizes(checked);
    
    if (checked && sizes.length === 0) {
      // Initialize with one size using the current product price
      setSizes([
        {
          id: 0,
          product_id: ('id' in formData) ? formData.id : 0,
          name: "Padrão",
          price: formData.price,
          is_default: true
        }
      ]);
    }
  };

  const addSize = () => {
    setSizes([
      ...sizes,
      {
        id: 0,
        product_id: ('id' in formData) ? formData.id : 0,
        name: "",
        price: 0,
        is_default: sizes.length === 0
      }
    ]);
  };

  const updateSize = (index: number, field: keyof ProductSize, value: any) => {
    const updatedSizes = [...sizes];
    updatedSizes[index] = {
      ...updatedSizes[index],
      [field]: field === 'price' && typeof value === 'string'
        ? parseFloat(value)
        : value
    };
    setSizes(updatedSizes);
  };

  const removeSize = (index: number) => {
    const updatedSizes = [...sizes];
    updatedSizes.splice(index, 1);
    
    // If we removed the default size, make the first one default
    if (updatedSizes.length > 0 && !updatedSizes.some(s => s.is_default)) {
      updatedSizes[0].is_default = true;
    }
    
    setSizes(updatedSizes);
  };

  const setDefaultSize = (index: number) => {
    const updatedSizes = sizes.map((size, i) => ({
      ...size,
      is_default: i === index
    }));
    setSizes(updatedSizes);
  };

  const toggleComplement = (complementId: number) => {
    if (selectedComplements.includes(complementId)) {
      setSelectedComplements(selectedComplements.filter(id => id !== complementId));
    } else {
      setSelectedComplements([...selectedComplements, complementId]);
    }
  };

  return {
    formData,
    setFormData,
    sizes,
    setSizes,
    hasMultipleSizes,
    setHasMultipleSizes,
    availableComplements,
    setAvailableComplements,
    selectedComplements,
    setSelectedComplements,
    handleChange,
    handlePriceChange,
    handleCategoryChange,
    handleStatusChange,
    handleHalfHalfChange,
    handleHalfHalfPriceRuleChange,
    handleHasStockControlChange,
    handleStockQuantityChange,
    handleImageUpload,
    handleMultipleSizesChange,
    addSize,
    updateSize,
    removeSize,
    setDefaultSize,
    toggleComplement
  };
};
