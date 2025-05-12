
import { useState } from "react";
import { ComplementGroup } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUploader from "./FileUploader";

interface ComplementGroupFormProps {
  group?: ComplementGroup;
  onSubmit: (group: Omit<ComplementGroup, "id"> | ComplementGroup) => Promise<void>;
  onCancel: () => void;
}

const ComplementGroupForm = ({ group, onSubmit, onCancel }: ComplementGroupFormProps) => {
  const [formData, setFormData] = useState<Omit<ComplementGroup, "id"> | ComplementGroup>({
    id: group?.id || 0,
    name: group?.name || "",
    groupType: group?.groupType || "ingredients",
    isActive: group?.isActive !== undefined ? group.isActive : true,
    imageUrl: group?.imageUrl || "",
    minimumQuantity: group?.minimumQuantity || 0,
    maximumQuantity: group?.maximumQuantity || 0,
    isRequired: group?.isRequired || false
  });

  const isEditing = !!group;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value) || 0 });
  };

  const handleTypeChange = (value: string) => {
    setFormData({ 
      ...formData, 
      groupType: value as 'ingredients' | 'specifications' | 'cross_sell' | 'disposables' 
    });
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData({ ...formData, isActive: checked });
  };

  const handleRequiredChange = (checked: boolean) => {
    setFormData({ ...formData, isRequired: checked });
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Nome do grupo é obrigatório");
      return;
    }
    
    // Validate minimum and maximum quantities
    if (formData.maximumQuantity > 0 && formData.maximumQuantity < formData.minimumQuantity) {
      alert("Quantidade máxima deve ser maior ou igual à quantidade mínima");
      return;
    }
    
    await onSubmit(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Grupo" : "Adicionar Grupo"}</CardTitle>
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
              placeholder="Nome do grupo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupType">Tipo</Label>
            <Select
              value={formData.groupType}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id="groupType">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingredients">Ingredientes</SelectItem>
                <SelectItem value="specifications">Especificações</SelectItem>
                <SelectItem value="cross_sell">Venda cruzada</SelectItem>
                <SelectItem value="disposables">Descartáveis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumQuantity">Quantidade mínima</Label>
              <Input
                id="minimumQuantity"
                name="minimumQuantity"
                type="number"
                min="0"
                value={formData.minimumQuantity}
                onChange={handleNumberChange}
              />
              <p className="text-xs text-muted-foreground">Mínimo de itens que o cliente deve escolher (0 = opcional)</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maximumQuantity">Quantidade máxima</Label>
              <Input
                id="maximumQuantity"
                name="maximumQuantity"
                type="number"
                min="0"
                value={formData.maximumQuantity}
                onChange={handleNumberChange}
              />
              <p className="text-xs text-muted-foreground">Máximo de itens que o cliente pode escolher (0 = ilimitado)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagem do Grupo</Label>
            <FileUploader 
              onUploadComplete={handleImageUpload}
              currentImageUrl={formData.imageUrl}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleStatusChange}
            />
            <Label htmlFor="isActive">Grupo ativo</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isRequired"
              checked={formData.isRequired}
              onCheckedChange={handleRequiredChange}
            />
            <Label htmlFor="isRequired">Obrigatório escolher</Label>
            <span className="text-xs text-muted-foreground ml-2">(Cliente deve escolher os complementos deste grupo)</span>
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

export default ComplementGroupForm;
