
import { useState, useEffect } from "react";
import { Complement, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploader from "./FileUploader";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ComplementFormProps {
  complement?: Complement;
  onSubmit: (complement: Omit<Complement, "id"> | Complement) => Promise<void>;
  onCancel: () => void;
}

const ComplementForm = ({ complement, onSubmit, onCancel }: ComplementFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Omit<Complement, "id"> | Complement>({
    id: complement?.id || 0,
    name: complement?.name || "",
    price: complement?.price || 0,
    isActive: complement?.isActive !== undefined ? complement.isActive : true,
    image_url: complement?.image_url || "",
    hasStockControl: complement?.hasStockControl || false,
    stockQuantity: complement?.stockQuantity || 0
  });
  const [tabValue, setTabValue] = useState<string>("manual");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const isEditing = !!complement;

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true);
        
      if (error) throw error;
      
      const formattedProducts: Product[] = data.map(prod => ({
        id: prod.id,
        name: prod.name,
        description: prod.description || "",
        price: prod.price,
        categoryId: prod.category_id || 0,
        isActive: prod.is_active,
        image_url: prod.image_url || ""
      }));
      
      setProducts(formattedProducts);
    } catch (error: any) {
      toast.error("Erro ao carregar produtos");
      console.error("Error loading products:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) || 0 });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value) || 0 });
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData({ ...formData, isActive: checked });
  };

  const handleStockControlChange = (checked: boolean) => {
    setFormData({ ...formData, hasStockControl: checked });
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, image_url: url });
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    const term = searchTerm.toLowerCase().trim();
    const results = products.filter(
      product => product.name.toLowerCase().includes(term)
    );
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      ...formData,
      name: product.name,
      price: product.price,
      image_url: product.image_url || ""
    });
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Nome do complemento é obrigatório");
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
          <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="manual" className="flex-1">Complemento Manual</TabsTrigger>
              <TabsTrigger value="product" className="flex-1">Usar Produto</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4 mt-4">
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
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handlePriceChange}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Imagem do Complemento</Label>
                <FileUploader 
                  onUploadComplete={handleImageUpload}
                  currentImageUrl={formData.image_url}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="product" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="searchProduct">Buscar produto</Label>
                <div className="flex gap-2">
                  <Input
                    id="searchProduct"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite o nome do produto..."
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Buscar
                  </Button>
                </div>
              </div>
              
              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  {searchResults.map(product => (
                    <div 
                      key={product.id} 
                      className="p-2 border-b last:border-b-0 flex justify-between items-center hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="flex items-center gap-2">
                        {product.image_url && (
                          <div className="w-8 h-8 rounded overflow-hidden">
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        <span>{product.name}</span>
                      </div>
                      <span className="text-primary font-medium">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedProduct && (
                <div className="p-4 border rounded-md">
                  <div className="flex items-center gap-4">
                    {selectedProduct.image_url && (
                      <div className="w-16 h-16 rounded-md overflow-hidden">
                        <img 
                          src={selectedProduct.image_url} 
                          alt={selectedProduct.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{selectedProduct.name}</h3>
                      <p className="text-primary">
                        R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Switch
                id="hasStockControl"
                checked={formData.hasStockControl}
                onCheckedChange={handleStockControlChange}
              />
              <Label htmlFor="hasStockControl">Controlar estoque</Label>
            </div>
            
            {formData.hasStockControl && (
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Quantidade em estoque</Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={handleNumberChange}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleStatusChange}
              />
              <Label htmlFor="isActive">Complemento ativo</Label>
            </div>
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
