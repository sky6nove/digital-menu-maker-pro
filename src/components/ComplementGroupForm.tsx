
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
    imageUrl: group?.imageUrl || ""
  });

  const isEditing = !!group;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Nome do grupo é obrigatório");
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
