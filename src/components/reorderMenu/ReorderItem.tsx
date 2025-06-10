
import React, { useCallback, useState } from "react";
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

const ReorderItem: React.FC<ReorderItemProps> = React.memo(({ 
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
  const [isMoving, setIsMoving] = useState(false);

  const handleItemClick = useCallback(() => {
    if (onClick && !disabled && !isMoving) {
      onClick(id);
    }
  }, [onClick, disabled, isMoving, id]);

  const handleMoveUp = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isFirst || isMoving) return;
    
    setIsMoving(true);
    try {
      await onMoveUp(id);
    } catch (error) {
      console.error("Error moving item up:", error);
    } finally {
      setIsMoving(false);
    }
  }, [disabled, isFirst, isMoving, onMoveUp, id]);

  const handleMoveDown = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isLast || isMoving) return;
    
    setIsMoving(true);
    try {
      await onMoveDown(id);
    } catch (error) {
      console.error("Error moving item down:", error);
    } finally {
      setIsMoving(false);
    }
  }, [disabled, isLast, isMoving, onMoveDown, id]);

  return (
    <TableRow 
      className={`transition-colors ${onClick && !disabled && !isMoving ? 'cursor-pointer hover:bg-muted/50' : ''} ${isSelected ? 'bg-muted' : ''} ${disabled || isMoving ? 'opacity-50' : ''}`}
      onClick={handleItemClick}
    >
      <TableCell className="py-2">
        <div className="flex items-center gap-2">
          <span className={isActive ? "" : "line-through text-muted-foreground"}>
            {name}
          </span>
          {isMoving && <span className="text-xs text-muted-foreground">Movendo...</span>}
        </div>
      </TableCell>
      <TableCell className="p-0 w-16">
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleMoveUp}
            disabled={disabled || isFirst || isMoving}
            className="h-7 w-7"
            title="Mover para cima"
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleMoveDown}
            disabled={disabled || isLast || isMoving}
            className="h-7 w-7"
            title="Mover para baixo"
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

ReorderItem.displayName = "ReorderItem";

export default ReorderItem;
