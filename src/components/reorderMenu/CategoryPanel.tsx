
import React from "react";
import ReorderPanel from "./ReorderPanel";
import ItemList from "./ItemList";
import { Category } from "@/types";

interface CategoryPanelProps {
  categories: Category[];
  activeCategory: number | null;
  saving?: boolean;
  handleCategorySelect: (id: number) => void;
  handleCategoryMove: (id: number, direction: 'up' | 'down') => Promise<boolean | void>;
}

const CategoryPanel: React.FC<CategoryPanelProps> = ({
  categories,
  activeCategory,
  saving = false,
  handleCategorySelect,
  handleCategoryMove
}) => {
  return (
    <ReorderPanel 
      title="Categorias" 
      selectedId={activeCategory}
    >
      <ItemList
        items={categories}
        onMoveUp={(id) => handleCategoryMove(id, 'up')}
        onMoveDown={(id) => handleCategoryMove(id, 'down')}
        onClick={handleCategorySelect}
        selectedId={activeCategory}
        disabled={saving}
      />
    </ReorderPanel>
  );
};

export default CategoryPanel;
