
import { useState, useEffect } from "react";
import { Product, Category } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (product: Omit<Product, "id"> | Product) => void;
  onCancel: () => void;
}

const ProductForm = ({ product, categories, onSubmit, onCancel }: ProductFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<Product, "id"> | Product>({
    id: product?.id || 0,
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    categoryId: product?.categoryId || (categories[0]?.id || 1),
    isActive: product?.isActive !== undefined ? product.isActive : true,
  });

  const isEditing = !!product;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and up to one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setFormData({ ...formData, price: value === "" ? 0 : parseFloat(value) });
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, categoryId: parseInt(value) });
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData({ ...formData, isActive: checked });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para o produto",
        variant: "destructive",
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, insira um preço válido",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Produto" : "Adicionar Produto"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              onChange={handleChange}
              placeholder="Descrição do produto"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handlePriceChange}
              placeholder="0.00"
              required
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

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleStatusChange}
            />
            <Label htmlFor="isActive">Produto ativo</Label>
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

export default ProductForm;
