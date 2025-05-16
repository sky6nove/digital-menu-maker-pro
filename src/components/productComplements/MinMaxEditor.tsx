
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface MinMaxEditorProps {
  minQuantity: number;
  maxQuantity: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  onSave: () => void;
}

export const MinMaxEditor = ({
  minQuantity,
  maxQuantity,
  onMinChange,
  onMaxChange,
  onSave
}: MinMaxEditorProps) => {
  return (
    <div className="flex items-center gap-2 ml-1" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center">
        <span className="text-xs mr-1">Min:</span>
        <Input
          type="number"
          min="0"
          className="h-6 w-12 text-xs"
          value={minQuantity}
          onChange={(e) => onMinChange(parseInt(e.target.value) || 0)}
        />
      </div>
      <div className="flex items-center">
        <span className="text-xs mr-1">Max:</span>
        <Input
          type="number"
          min="0"
          className="h-6 w-12 text-xs"
          value={maxQuantity}
          onChange={(e) => onMaxChange(parseInt(e.target.value) || 0)}
        />
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6" 
        onClick={(e) => {
          e.stopPropagation();
          onSave();
        }}
      >
        <Save className="h-4 w-4" />
      </Button>
    </div>
  );
};
