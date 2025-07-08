
import { Product, Category } from "@/types";
import CategoryProductsSection from "./ProductTable/CategoryProductsSection";
import UncategorizedProductsSection from "./ProductTable/UncategorizedProductsSection";
import EmptyProductsState from "./ProductTable/EmptyProductsState";

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAddProduct: (categoryId?: number) => void;
}

const ProductTable = ({ products, categories, onEdit, onDelete, onAddProduct }: ProductTableProps) => {
  const groupedProducts = categories.reduce((acc, category) => {
    const categoryProducts = products.filter(p => p.categoryId === category.id);
    if (categoryProducts.length > 0) {
      acc[category.id] = {
        category,
        products: categoryProducts
      };
    }
    return acc;
  }, {} as Record<number, { category: Category; products: Product[] }>);

  const productsWithoutCategory = products.filter(p => 
    !categories.some(c => c.id === p.categoryId)
  );

  const hasNoProducts = Object.keys(groupedProducts).length === 0 && productsWithoutCategory.length === 0;

  if (hasNoProducts) {
    return <EmptyProductsState onAddProduct={() => onAddProduct()} />;
  }

  return (
    <div className="space-y-6">
      {Object.values(groupedProducts).map(({ category, products: categoryProducts }) => (
        <CategoryProductsSection
          key={category.id}
          category={category}
          products={categoryProducts}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddProduct={onAddProduct}
        />
      ))}

      <UncategorizedProductsSection
        products={productsWithoutCategory}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddProduct={() => onAddProduct()}
      />
    </div>
  );
};

export default ProductTable;
