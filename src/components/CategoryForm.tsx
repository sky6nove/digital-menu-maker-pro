
import { useState } from "react";
import { Category } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (category: Omit<Category, "id"> | Category) => void;
  onCancel: () => void;
}

// Predefined category options
const CATEGORY_OPTIONS = [
  "Pizza",
  "Burger",
  "Pasta",
  "Salada",
  "Sobremesa",
  "Bebida",
  "Combo",
  "Promoção"
];

const CategoryForm = ({ category, onSubmit, onCancel }: CategoryFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<Category, "id"> | Category>({
    id: category?.id || 0,
    name: category?.name || "",
    isActive: category?.isActive !== undefined ? category.isActive : true,
    order: category?.order || 0,
  });

  const isEditing = !!category;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData({ ...formData, isActive: checked });
  };

  const handleSelectCategory = (value: string) => {
    setFormData({ ...formData, name: value });
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

    onSubmit(formData);
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
            <div className="flex flex-col space-y-2">
              <Select
                value={formData.name}
                onValueChange={handleSelectCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria ou digite abaixo" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative mt-2">
                <Label htmlFor="custom-name" className="text-xs">Ou digite um nome personalizado:</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nome da categoria"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleStatusChange}
            />
            <Label htmlFor="isActive">Categoria ativa</Label>
          </div>
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
