
import React from "react";
import ReorderPanel from "./ReorderPanel";
import ItemList from "./ItemList";
import { Category } from "@/types";

interface CategoryPanelProps {
  categories: Category[];
  activeCategory: number | null;
  handleCategorySelect: (id: number) => void;
  handleCategoryMove: (id: number, direction: 'up' | 'down') => void;
}

const CategoryPanel: React.FC<CategoryPanelProps> = ({
  categories,
  activeCategory,
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
      />
    </ReorderPanel>
  );
};

export default CategoryPanel;
