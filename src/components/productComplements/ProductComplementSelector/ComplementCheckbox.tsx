
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ComplementCheckboxProps } from "./types";

export const ComplementCheckbox: React.FC<ComplementCheckboxProps> = ({
  groupId,
  complement,
  isSelected,
  onSelect,
  formatPrice
}) => {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`complement-${groupId}-${complement.id}`}
          checked={isSelected}
          onCheckedChange={(checked) => {
            onSelect(
              groupId,
              complement,
              checked ? 1 : -1
            );
          }}
        />
        <label
          htmlFor={`complement-${groupId}-${complement.id}`}
          className="text-sm cursor-pointer"
        >
          {complement.name}
        </label>
      </div>
      
      {complement.price > 0 && (
        <span className="text-sm text-menu-accent">
          + R$ {formatPrice(complement.price)}
        </span>
      )}
    </div>
  );
};
