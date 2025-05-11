
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (category: Omit<Category, "id"> | Category) => void;
  onCancel: () => void;
}

const CategoryForm = ({ category, onSubmit, onCancel }: CategoryFormProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<(Omit<Category, "id"> | Category)>({
    id: category?.id || 0,
    name: category?.name || "",
    isActive: category?.isActive !== undefined ? category.isActive : true,
    order: category?.order || 0,
    allowHalfHalf: category?.allowHalfHalf || false,
    halfHalfPriceRule: category?.halfHalfPriceRule || "highest",
    categoryType: category?.categoryType || "regular",
    hasPortions: category?.hasPortions || false,
    portionsLabel: category?.portionsLabel || "Serve",
  });

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

  const handleCategoryTypeChange = (value: string) => {
    setFormData({ 
      ...formData, 
      categoryType: value as 'regular' | 'pizza',
      // If changing to pizza, automatically enable half/half option
      allowHalfHalf: value === 'pizza' ? true : formData.allowHalfHalf
    });
  };

  const handleHasPortionsChange = (checked: boolean) => {
    setFormData({ ...formData, hasPortions: checked });
  };

  const handleHalfHalfPriceRuleChange = (value: string) => {
    setFormData({ ...formData, halfHalfPriceRule: value as 'lowest' | 'highest' | 'average' });
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mx-6">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="advanced">Opções Avançadas</TabsTrigger>
            {formData.categoryType === "pizza" && (
              <TabsTrigger value="pizza">Opções de Pizza</TabsTrigger>
            )}
          </TabsList>
          
          <CardContent className="space-y-4">
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nome da categoria"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryType">Tipo de Categoria</Label>
                <Select
                  value={formData.categoryType}
                  onValueChange={handleCategoryTypeChange}
                >
                  <SelectTrigger id="categoryType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Itens Principais</SelectItem>
                    <SelectItem value="pizza">Pizza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={handleStatusChange}
                />
                <Label htmlFor="isActive">Categoria ativa</Label>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="space-y-4 p-3 border rounded-md bg-slate-50">
                <h3 className="font-medium text-sm">Opções de Porções</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasPortions"
                    checked={formData.hasPortions}
                    onCheckedChange={handleHasPortionsChange}
                  />
                  <Label htmlFor="hasPortions">Esta categoria tem porções</Label>
                </div>
                
                {formData.hasPortions && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="portionsLabel">Rótulo de porções</Label>
                    <Input
                      id="portionsLabel"
                      name="portionsLabel"
                      value={formData.portionsLabel}
                      onChange={handleChange}
                      placeholder="Ex: Serve"
                    />
                    <p className="text-xs text-gray-500">
                      Este rótulo será exibido como "Serve X pessoas"
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {formData.categoryType === "pizza" && (
              <TabsContent value="pizza" className="space-y-4 pt-4">
                <div className="space-y-4 p-3 border rounded-md bg-slate-50">
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
              </TabsContent>
            )}
          </CardContent>
        </Tabs>
        
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
