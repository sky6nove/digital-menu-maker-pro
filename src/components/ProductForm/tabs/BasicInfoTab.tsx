
import { Product, Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface BasicInfoTabProps {
  formData: Omit<Product, "id"> | Product;
  categories: Category[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const BasicInfoTab = ({
  formData,
  categories,
  onChange
}: BasicInfoTabProps) => {
  const handleCategoryChange = (value: string) => {
    // Create a synthetic event to match the expected onChange signature
    const syntheticEvent = {
      target: {
        name: 'categoryId',
        value: parseInt(value)
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const handleStatusChange = (checked: boolean) => {
    const syntheticEvent = {
      target: {
        name: 'isActive',
        value: checked
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      const syntheticEvent = {
        target: {
          name: 'price',
          value: value === "" ? 0 : parseFloat(value)
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="Nome do produto"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={onChange}
          placeholder="Descrição do produto"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select
          value={formData.categoryId.toString()}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Preço (R$)</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handlePriceChange}
            placeholder="0.00"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={handleStatusChange}
        />
        <Label htmlFor="isActive">Produto ativo</Label>
      </div>
    </div>
  );
};

export default BasicInfoTab;
