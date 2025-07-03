
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";

interface StockTabProps {
  hasStockControl: boolean;
  stockQuantity: number;
  onChange: (field: string, value: any) => void;
}

const StockTab = ({
  hasStockControl,
  stockQuantity,
  onChange
}: StockTabProps) => {
  const handleHasStockControlChange = (checked: boolean) => {
    onChange('hasStockControl', checked);
  };

  const handleStockQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      onChange('stockQuantity', value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="hasStockControl"
          checked={hasStockControl}
          onCheckedChange={handleHasStockControlChange}
        />
        <Label htmlFor="hasStockControl">Habilitar controle de estoque</Label>
      </div>
      
      {hasStockControl && (
        <div className="space-y-2 mt-4">
          <Label htmlFor="stockQuantity">Quantidade em estoque</Label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min="0"
              value={stockQuantity}
              onChange={handleStockQuantityChange}
              placeholder="0"
              className="pl-10"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTab;
