
import { ProductSize } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash, DollarSign } from "lucide-react";

interface SizesTabProps {
  sizes: ProductSize[];
  onChange: (sizes: ProductSize[]) => void;
}

const SizesTab = ({
  sizes,
  onChange
}: SizesTabProps) => {
  const addSize = () => {
    const newSizes = [
      ...sizes,
      {
        id: 0,
        product_id: 0,
        name: "",
        price: 0,
        is_default: sizes.length === 0
      }
    ];
    onChange(newSizes);
  };

  const updateSize = (index: number, field: keyof ProductSize, value: any) => {
    const updatedSizes = [...sizes];
    updatedSizes[index] = {
      ...updatedSizes[index],
      [field]: field === 'price' && typeof value === 'string' 
        ? parseFloat(value) 
        : value
    };
    onChange(updatedSizes);
  };

  const removeSize = (index: number) => {
    const updatedSizes = [...sizes];
    updatedSizes.splice(index, 1);
    
    // If we removed the default size, make the first one default
    if (updatedSizes.length > 0 && !updatedSizes.some(s => s.is_default)) {
      updatedSizes[0].is_default = true;
    }
    
    onChange(updatedSizes);
  };

  const setDefaultSize = (index: number) => {
    const updatedSizes = sizes.map((size, i) => ({
      ...size,
      is_default: i === index
    }));
    onChange(updatedSizes);
  };

  return (
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
  );
};

export default SizesTab;
