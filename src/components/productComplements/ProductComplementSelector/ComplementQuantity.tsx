
import React from "react";
import { Minus, Plus } from "lucide-react";
import { ComplementQuantityProps } from "./types";

export const ComplementQuantity: React.FC<ComplementQuantityProps> = ({
  groupId,
  complement,
  currentQuantity,
  onSelect,
  formatPrice
}) => {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex flex-1">
        <span className="text-sm">{complement.name}</span>
      </div>
      
      <div className="flex items-center gap-1">
        {complement.price > 0 && (
          <span className="text-sm text-menu-accent mr-2">
            R$ {formatPrice(complement.price)}
          </span>
        )}
        
        <button
          type="button"
          className="rounded-full w-6 h-6 flex items-center justify-center border border-gray-300 text-gray-500 disabled:opacity-50"
          onClick={() => onSelect(groupId, complement, -1)}
          disabled={!currentQuantity}
        >
          <Minus className="h-3 w-3" />
        </button>
        
        <span className="w-8 text-center text-sm">
          {currentQuantity}
        </span>
        
        <button
          type="button"
          className="rounded-full w-6 h-6 flex items-center justify-center border border-menu-accent text-menu-accent"
          onClick={() => onSelect(groupId, complement, 1)}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
