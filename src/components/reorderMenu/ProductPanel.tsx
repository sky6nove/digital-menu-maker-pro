
import React from "react";
import ReorderPanel from "./ReorderPanel";
import ItemList from "./ItemList";
import { Product } from "@/types";

interface ProductPanelProps {
  products: Product[];
  activeCategory: number | null;
  activeProduct: number | null;
  categoryName?: string;
  loading?: boolean;
  saving?: boolean;
  handleProductSelect: (id: number) => void;
  handleProductMove: (id: number, direction: 'up' | 'down') => Promise<boolean | void>;
}

const ProductPanel: React.FC<ProductPanelProps> = ({
  products,
  activeCategory,
  activeProduct,
  categoryName,
  loading = false,
  saving = false,
  handleProductSelect,
  handleProductMove
}) => {
  return (
    <ReorderPanel 
      title={`Itens${categoryName ? ` - ${categoryName}` : ''}`}
      emptyMessage="Selecione uma categoria para visualizar seus itens"
    >
      {activeCategory ? (
        <ItemList
          items={products}
          onMoveUp={(id) => handleProductMove(id, 'up')}
          onMoveDown={(id) => handleProductMove(id, 'down')}
          onClick={handleProductSelect}
          selectedId={activeProduct}
          loading={loading}
          disabled={saving}
        />
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          Selecione uma categoria para visualizar seus itens
        </div>
      )}
    </ReorderPanel>
  );
};

export default ProductPanel;
