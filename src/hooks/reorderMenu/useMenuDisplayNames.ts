
export const useMenuDisplayNames = (
  categories: any[],
  products: any[],
  productGroups: any[],
  activeCategory: number | null,
  activeProduct: number | null,
  activeGroup: number | null
) => {
  // Get display names for active items
  const activeCategoryName = activeCategory 
    ? categories.find(c => c.id === activeCategory)?.name 
    : '';

  const activeProductName = activeProduct
    ? products.find(p => p.id === activeProduct)?.name
    : '';

  const activeGroupName = activeGroup 
    ? productGroups.find(g => g.id === activeGroup)?.name 
    : '';

  return {
    activeCategoryName,
    activeProductName,
    activeGroupName
  };
};
