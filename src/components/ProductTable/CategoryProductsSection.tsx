import { Product, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import ProductsTable from "./ProductsTable";

interface CategoryProductsSectionProps {
  category: Category;
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAddProduct: (categoryId?: number) => void;
}

const CategoryProductsSection = ({ 
  category, 
  products, 
  onEdit, 
  onDelete, 
  onAddProduct 
}: CategoryProductsSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{category.name}</h3>
          <Badge variant={category.isActive ? "default" : "secondary"}>
            {products.length} produtos
          </Badge>
        </div>
        <Button 
          size="sm" 
          onClick={() => onAddProduct(category.id)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar produto
        </Button>
      </div>
      
      <ProductsTable products={products} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

export default CategoryProductsSection;