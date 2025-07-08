import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import ProductsTable from "./ProductsTable";

interface UncategorizedProductsSectionProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAddProduct: () => void;
}

const UncategorizedProductsSection = ({ 
  products, 
  onEdit, 
  onDelete, 
  onAddProduct 
}: UncategorizedProductsSectionProps) => {
  if (products.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Produtos sem categoria</h3>
          <Badge variant="secondary">
            {products.length} produtos
          </Badge>
        </div>
        <Button 
          size="sm" 
          onClick={onAddProduct}
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

export default UncategorizedProductsSection;