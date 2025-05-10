
import { useState } from "react";
import { Category } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (category: Omit<Category, "id"> | Category) => void;
  onCancel: () => void;
}

const CategoryForm = ({ category, onSubmit, onCancel }: CategoryFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<(Omit<Category, "id"> | Category) & { allowHalfHalf?: boolean, halfHalfPriceRule?: 'lowest' | 'highest' | 'average' }>({
    id: category?.id || 0,
    name: category?.name || "",
    isActive: category?.isActive !== undefined ? category.isActive : true,
    order: category?.order || 0,
    allowHalfHalf: category?.allowHalfHalf || false,
    halfHalfPriceRule: category?.halfHalfPriceRule || "highest",
  });

  const [isPizzaCategory, setIsPizzaCategory] = useState<boolean>(
    category?.name?.toLowerCase().includes('pizza') || false
  );

  const isEditing = !!category;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData({ ...formData, isActive: checked });
  };

  const handleAllowHalfHalfChange = (checked: boolean) => {
    setFormData({ ...formData, allowHalfHalf: checked });
  };

  const handleHalfHalfPriceRuleChange = (value: string) => {
    setFormData({ ...formData, halfHalfPriceRule: value as 'lowest' | 'highest' | 'average' });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ ...formData, name: value });
    
    // Check if the category name contains "pizza" to show pizza-specific options
    setIsPizzaCategory(value.toLowerCase().includes('pizza'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a categoria",
        variant: "destructive",
      });
      return;
    }

    // Only include pizza-specific properties if it's a pizza category
    const categoryData = {
      ...formData,
      // If not a pizza category, remove these properties
      ...(isPizzaCategory ? {} : { allowHalfHalf: undefined, halfHalfPriceRule: undefined })
    };

    onSubmit(categoryData);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Categoria" : "Adicionar Categoria"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Nome da categoria"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleStatusChange}
            />
            <Label htmlFor="isActive">Categoria ativa</Label>
          </div>

          {isPizzaCategory && (
            <div className="space-y-4 mt-4 p-3 border rounded-md bg-slate-50">
              <h3 className="font-medium text-sm">Opções específicas para Pizza</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowHalfHalf"
                  checked={formData.allowHalfHalf}
                  onCheckedChange={handleAllowHalfHalfChange}
                />
                <Label htmlFor="allowHalfHalf">Permitir meia/meia (2 sabores)</Label>
              </div>
              
              {formData.allowHalfHalf && (
                <div className="space-y-2 pt-2">
                  <Label>Regra de preço para meia/meia</Label>
                  <RadioGroup 
                    value={formData.halfHalfPriceRule} 
                    onValueChange={handleHalfHalfPriceRuleChange}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="highest" id="highest" />
                      <Label htmlFor="highest">Maior preço</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lowest" id="lowest" />
                      <Label htmlFor="lowest">Menor preço</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="average" id="average" />
                      <Label htmlFor="average">Média dos preços</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary">
            {isEditing ? "Atualizar" : "Adicionar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CategoryForm;
