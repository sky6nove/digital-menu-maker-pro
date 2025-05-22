
import React from "react";
import ReorderItem from "./ReorderItem";
import { Table, TableBody } from "@/components/ui/table";

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
  loading?: boolean;
}

function ItemList<T extends Item>({ 
  items, 
  onMoveUp, 
  onMoveDown, 
  onClick,
  selectedId,
  loading = false
}: ItemListProps<T>) {
  // Ensure items is always an array, even if undefined is passed
  const safeItems = items || [];
  
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }
  
  return (
    <>
      {safeItems.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          Nenhum item encontrado.
        </div>
      ) : (
        <Table>
          <TableBody>
            {safeItems.map((item, index) => (
              <ReorderItem 
                key={item.id}
                id={item.id}
                name={item.name}
                isActive={item.isActive !== false}
                isFirst={index === 0}
                isLast={index === safeItems.length - 1}
                onClick={onClick}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                isSelected={selectedId === item.id}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

export default ItemList;
