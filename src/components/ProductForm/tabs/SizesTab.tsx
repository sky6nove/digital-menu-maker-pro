
import { ProductSize } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash, DollarSign } from "lucide-react";

interface SizesTabProps {
  hasMultipleSizes: boolean;
  sizes: ProductSize[];
  handleMultipleSizesChange: (checked: boolean) => void;
  addSize: () => void;
  updateSize: (index: number, field: keyof ProductSize, value: any) => void;
  removeSize: (index: number) => void;
  setDefaultSize: (index: number) => void;
}

const SizesTab = ({
  hasMultipleSizes,
  sizes,
  handleMultipleSizesChange,
  addSize,
  updateSize,
  removeSize,
  setDefaultSize
}: SizesTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="hasSizes"
          checked={hasMultipleSizes}
          onCheckedChange={handleMultipleSizesChange}
        />
        <Label htmlFor="hasSizes">Este produto tem múltiplos tamanhos</Label>
      </div>
      
      {hasMultipleSizes && (
        <div className="space-y-4">
          {sizes.map((size, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50">
              <div className="flex-1">
                <Input
                  placeholder="Nome do tamanho"
                  value={size.name}
                  onChange={(e) => updateSize(index, 'name', e.target.value)}
                />
              </div>
              <div className="w-1/3">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Preço"
                    value={size.price}
                    onChange={(e) => updateSize(index, 'price', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={size.is_default}
                  onCheckedChange={() => setDefaultSize(index)}
                  disabled={size.is_default}
                />
                <Label className="cursor-pointer" onClick={() => !size.is_default && setDefaultSize(index)}>
                  Padrão
                </Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSize(index)}
                disabled={sizes.length === 1}
              >
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addSize}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Tamanho
          </Button>
        </div>
      )}
    </div>
  );
};

export default SizesTab;
