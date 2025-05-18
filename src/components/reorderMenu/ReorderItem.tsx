
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
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  isSelected?: boolean;
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
  isSelected = false
}) => {
  return (
    <TableRow 
      className={`${onClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-muted' : ''}`}
      onClick={() => onClick && onClick(id)}
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
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(id);
            }}
            disabled={isFirst}
            className="h-7 w-7"
          >
            <span className="sr-only">Move up</span>
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(id);
            }}
            disabled={isLast}
            className="h-7 w-7"
          >
            <span className="sr-only">Move down</span>
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ReorderItem;
