
import { useState } from "react";
import { Complement } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DollarSign, Package } from "lucide-react";
import FileUploader from "./FileUploader";

interface ComplementFormProps {
  complement?: Complement;
  onSubmit: (complement: Omit<Complement, "id"> | Complement) => Promise<void>;
  onCancel: () => void;
}

const ComplementForm = ({ complement, onSubmit, onCancel }: ComplementFormProps) => {
  const [formData, setFormData] = useState<Omit<Complement, "id"> | Complement>({
    id: complement?.id || 0,
    name: complement?.name || "",
    price: complement?.price || 0,
    isActive: complement?.isActive !== undefined ? complement.isActive : true,
    image_url: complement?.image_url || "",
    hasStockControl: complement?.hasStockControl || false,
    stockQuantity: complement?.stockQuantity || 0
  });

  const isEditing = !!complement;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleStatusChange = (checked: boolean) => {
    setFormData({ ...formData, isActive: checked });
  };

  const handleStockControlChange = (checked: boolean) => {
    setFormData({ ...formData, hasStockControl: checked });
  };

  const handleStockQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setFormData({ ...formData, stockQuantity: value });
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, image_url: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Nome do complemento é obrigatório");
      return;
    }
    
    if (formData.price < 0) {
      alert("Preço não pode ser negativo");
      return;
    }
    
    await onSubmit(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Complemento" : "Adicionar Complemento"}</CardTitle>
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
              placeholder="Nome do complemento"
              required
            />
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

          <div className="space-y-2">
            <Label>Imagem do Complemento</Label>
            <FileUploader 
              onUploadComplete={handleImageUpload}
              currentImageUrl={formData.image_url}
            />
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleStatusChange}
              />
              <Label htmlFor="isActive">Complemento ativo</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="hasStockControl"
                checked={formData.hasStockControl}
                onCheckedChange={handleStockControlChange}
              />
              <Label htmlFor="hasStockControl">Controle de estoque</Label>
            </div>
            
            {formData.hasStockControl && (
              <div className="space-y-2 ml-7">
                <Label htmlFor="stockQuantity">Quantidade em estoque</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={handleStockQuantityChange}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
              </div>
            )}
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

export default ComplementForm;
