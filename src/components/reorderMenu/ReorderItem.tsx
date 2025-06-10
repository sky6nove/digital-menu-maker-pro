
import React from "react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ReorderItemProps {
  id: number;
  name: string;
  isActive?: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick?: (id: number) => void;
  onMoveUp: (id: number) => Promise<boolean | void>;
  onMoveDown: (id: number) => Promise<boolean | void>;
  isSelected?: boolean;
  disabled?: boolean;
}

const ReorderItem: React.FC<ReorderItemProps> = ({ 
  id, 
  name, 
  isActive = true, 
  isFirst, 
  isLast, 
  onClick, 
  onMoveUp, 
  onMoveDown,
  isSelected = false,
  disabled = false
}) => {
  const handleItemClick = () => {
    if (onClick && !disabled) {
      onClick(id);
    }
  };

  const handleMoveUp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isFirst) return;
    
    try {
      await onMoveUp(id);
    } catch (error) {
      console.error("Error moving item up:", error);
    }
  };

  const handleMoveDown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isLast) return;
    
    try {
      await onMoveDown(id);
    } catch (error) {
      console.error("Error moving item down:", error);
    }
  };

  return (
    <TableRow 
      className={`transition-colors ${onClick && !disabled ? 'cursor-pointer hover:bg-muted/50' : ''} ${isSelected ? 'bg-muted' : ''} ${disabled ? 'opacity-50' : ''}`}
      onClick={handleItemClick}
    >
      <TableCell className="py-2">
        <div className="flex items-center gap-2">
          <span className={isActive ? "" : "line-through text-muted-foreground"}>
            {name}
          </span>
        </div>
      </TableCell>
      <TableCell className="p-0 w-16">
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleMoveUp}
            disabled={disabled || isFirst}
            className="h-7 w-7"
            title="Mover para cima"
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleMoveDown}
            disabled={disabled || isLast}
            className="h-7 w-7"
            title="Mover para baixo"
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ReorderItem;
