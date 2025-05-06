
import { useState, useEffect } from "react";
import { Product, Category, ProductSize, Complement, ProductComplement } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import FileUploader from "./FileUploader";
import { Plus, Trash, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (product: Omit<Product, "id"> | Product, sizes?: ProductSize[]) => void;
  onCancel: () => void;
}

const ProductForm = ({ product, categories, onSubmit, onCancel }: ProductFormProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<Omit<Product, "id"> | Product>({
    id: product?.id || 0,
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    categoryId: product?.categoryId || (categories[0]?.id || 1),
    isActive: product?.isActive !== undefined ? product.isActive : true,
    image_url: product?.image_url || "",
    allow_half_half: product?.allow_half_half || false,
    half_half_price_rule: product?.half_half_price_rule || "highest",
  });
  
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [hasMultipleSizes, setHasMultipleSizes] = useState(false);
  const [availableComplements, setAvailableComplements] = useState<Complement[]>([]);
  const [selectedComplements, setSelectedComplements] = useState<number[]>([]);

  const isEditing = !!product;

  useEffect(() => {
    if (isEditing) {
      loadSizes();
      loadComplements();
    }
  }, [isEditing, product]);

  const loadSizes = async () => {
    if (!product?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("product_sizes")
        .select("*")
        .eq("product_id", product.id);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setSizes(data);
        setHasMultipleSizes(true);
      }
    } catch (error: any) {
      console.error("Error loading product sizes:", error);
      toast({
        title: "Erro ao carregar tamanhos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadComplements = async () => {
    try {
      // Load all available complements
      const { data: complementsData, error: complementsError } = await supabase
        .from("complements")
        .select("*")
        .eq("is_active", true);
        
      if (complementsError) throw complementsError;
      
      setAvailableComplements(complementsData || []);
      
      if (!product?.id) return;
      
      // Load selected complements for this product
      const { data: productComplementsData, error: productComplementsError } = await supabase
        .from("product_complements")
        .select("complement_id")
        .eq("product_id", product.id);
        
      if (productComplementsError) throw productComplementsError;
      
      if (productComplementsData) {
        setSelectedComplements(productComplementsData.map(pc => pc.complement_id));
      }
    } catch (error: any) {
      console.error("Error loading complements:", error);
      toast({
        title: "Erro ao carregar complementos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  const handleHalfHalfChange = (checked: boolean) => {
    setFormData({ ...formData, allow_half_half: checked });
  };

  const handleHalfHalfPriceRuleChange = (value: string) => {
    setFormData({ 
      ...formData, 
      half_half_price_rule: value as 'lowest' | 'highest' | 'average' 
    });
  };

  const handleMultipleSizesChange = (checked: boolean) => {
    setHasMultipleSizes(checked);
    
    if (checked && sizes.length === 0) {
      // Initialize with one size using the current product price
      setSizes([
        {
          id: 0,
          product_id: formData.id as number,
          name: "Padrão",
          price: formData.price,
          is_default: true
        }
      ]);
    }
  };

  const addSize = () => {
    setSizes([
      ...sizes,
      {
        id: 0,
        product_id: formData.id as number,
        name: "",
        price: 0,
        is_default: sizes.length === 0
      }
    ]);
  };

  const updateSize = (index: number, field: keyof ProductSize, value: any) => {
    const updatedSizes = [...sizes];
    updatedSizes[index] = {
      ...updatedSizes[index],
      [field]: field === 'price' && typeof value === 'string' 
        ? parseFloat(value) 
        : value
    };
    setSizes(updatedSizes);
  };

  const removeSize = (index: number) => {
    const updatedSizes = [...sizes];
    updatedSizes.splice(index, 1);
    
    // If we removed the default size, make the first one default
    if (updatedSizes.length > 0 && !updatedSizes.some(s => s.is_default)) {
      updatedSizes[0].is_default = true;
    }
    
    setSizes(updatedSizes);
  };

  const setDefaultSize = (index: number) => {
    const updatedSizes = sizes.map((size, i) => ({
      ...size,
      is_default: i === index
    }));
    setSizes(updatedSizes);
  };

  const toggleComplement = (complementId: number) => {
    if (selectedComplements.includes(complementId)) {
      setSelectedComplements(selectedComplements.filter(id => id !== complementId));
    } else {
      setSelectedComplements([...selectedComplements, complementId]);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, image_url: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!hasMultipleSizes && formData.price <= 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, insira um preço válido",
        variant: "destructive",
      });
      return;
    }

    if (hasMultipleSizes) {
      if (sizes.length === 0) {
        toast({
          title: "Tamanhos obrigatórios",
          description: "Por favor, adicione pelo menos um tamanho",
          variant: "destructive",
        });
        return;
      }
      
      for (const size of sizes) {
        if (!size.name.trim()) {
          toast({
            title: "Nome do tamanho obrigatório",
            description: "Por favor, insira um nome para todos os tamanhos",
            variant: "destructive",
          });
          return;
        }
        
        if (size.price <= 0) {
          toast({
            title: "Preço do tamanho inválido",
            description: "Por favor, insira um preço válido para todos os tamanhos",
            variant: "destructive",
          });
          return;
        }
      }
      
      if (!sizes.some(s => s.is_default)) {
        toast({
          title: "Tamanho padrão obrigatório",
          description: "Por favor, defina um tamanho como padrão",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      // Submit the product data
      const productResult = await onSubmit(formData, hasMultipleSizes ? sizes : undefined);
      
      // If product was created/updated successfully and we have product ID
      if (productResult && "id" in productResult) {
        const productId = productResult.id;
        
        // Update product complements
        await updateProductComplements(productId);
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const updateProductComplements = async (productId: number) => {
    try {
      // First, delete all existing relationships
      await supabase
        .from("product_complements")
        .delete()
        .eq("product_id", productId);
      
      // Then create new relationships for selected complements
      if (selectedComplements.length > 0) {
        const complementsToInsert = selectedComplements.map(complementId => ({
          product_id: productId,
          complement_id: complementId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }));
        
        await supabase
          .from("product_complements")
          .insert(complementsToInsert);
      }
    } catch (error: any) {
      console.error("Error updating product complements:", error);
      toast({
        title: "Erro ao atualizar complementos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Produto" : "Adicionar Produto"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mx-6">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="images">Imagens</TabsTrigger>
            <TabsTrigger value="sizes">Tamanhos</TabsTrigger>
            {formData.categoryId && categories.find(c => c.id === formData.categoryId)?.name.toLowerCase().includes("pizza") && (
              <TabsTrigger value="pizzaOptions">Opções de Pizza</TabsTrigger>
            )}
            <TabsTrigger value="complements">Complementos</TabsTrigger>
          </TabsList>
          
          <CardContent className="space-y-4 pt-4">
            <TabsContent value="basic" className="space-y-4">
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

              {!hasMultipleSizes && (
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
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={handleStatusChange}
                />
                <Label htmlFor="isActive">Produto ativo</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="images">
              <div className="space-y-4">
                <Label>Imagem do Produto</Label>
                <FileUploader 
                  onUploadComplete={handleImageUpload}
                  currentImageUrl={formData.image_url}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="sizes" className="space-y-4">
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
            </TabsContent>
            
            {formData.categoryId && categories.find(c => c.id === formData.categoryId)?.name.toLowerCase().includes("pizza") && (
              <TabsContent value="pizzaOptions" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowHalfHalf"
                    checked={formData.allow_half_half}
                    onCheckedChange={handleHalfHalfChange}
                  />
                  <Label htmlFor="allowHalfHalf">Permitir meia/meia</Label>
                </div>
                
                {formData.allow_half_half && (
                  <div className="space-y-2 pt-2">
                    <Label>Regra de preço para meia/meia</Label>
                    <RadioGroup 
                      value={formData.half_half_price_rule} 
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
              </TabsContent>
            )}
            
            <TabsContent value="complements" className="space-y-4">
              {availableComplements.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Nenhum complemento disponível</p>
                  <p className="text-sm mt-2">
                    Adicione complementos primeiro no menu de Complementos
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Complementos disponíveis para este produto</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableComplements.map(complement => (
                      <div 
                        key={complement.id} 
                        className={`p-3 rounded-md border flex items-center space-x-2 cursor-pointer ${
                          selectedComplements.includes(complement.id) 
                            ? 'border-primary bg-primary bg-opacity-10' 
                            : 'border-gray-200'
                        }`}
                        onClick={() => toggleComplement(complement.id)}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{complement.name}</p>
                          <p className="text-sm text-gray-500">
                            R$ {complement.price.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        <Switch 
                          checked={selectedComplements.includes(complement.id)}
                          onCheckedChange={() => toggleComplement(complement.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
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

export default ProductForm;
