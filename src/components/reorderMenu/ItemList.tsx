
import React from "react";
import ReorderItem from "./ReorderItem";

interface Item {
  id: number;
  name: string;
  isActive?: boolean;
}

interface ItemListProps<T extends Item> {
  items: T[];
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  onClick?: (id: number) => void;
  selectedId?: number | null;
}

function ItemList<T extends Item>({ 
  items, 
  onMoveUp, 
  onMoveDown, 
  onClick,
  selectedId
}: ItemListProps<T>) {
  // Ensure items is always an array, even if undefined is passed
  const safeItems = items || [];
  
  return (
    <>
      {safeItems.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          Nenhum item encontrado.
        </div>
      ) : (
        safeItems.map((item, index) => (
          <ReorderItem 
            key={item.id}
            id={item.id}
            name={item.name}
            isActive={item.isActive !== false}
            isFirst={index === 0}
            isLast={index === safeItems.length - 1}
            onClick={onClick}
            onMoveUp={(id) => {
              console.log("ItemList: Moving up item", id);
              onMoveUp(id);
            }}
            onMoveDown={(id) => {
              console.log("ItemList: Moving down item", id);
              onMoveDown(id);
            }}
            isSelected={selectedId === item.id}
          />
        ))
      )}
    </>
  );
}

export default ItemList;
