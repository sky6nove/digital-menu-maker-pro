
import { useState, useEffect } from "react";
import { Product, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useProductFormState } from "./hooks/useProductFormState";
import { useProductFormSubmit } from "./hooks/useProductFormSubmit";
import BasicInfoTab from "./tabs/BasicInfoTab";
import ImagesTab from "./tabs/ImagesTab";
import SizesTab from "./tabs/SizesTab";
import StockTab from "./tabs/StockTab";
import ComplementsTab from "./tabs/ComplementsTab";
import ComplementGroupsTab from "./tabs/ComplementGroupsTab";
import PizzaOptionsTab from "./tabs/PizzaOptionsTab";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (product: Omit<Product, "id"> | Product) => Promise<void>;
  onCancel: () => void;
}

const ProductForm = ({ product, categories, onSubmit, onCancel }: ProductFormProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  
  const {
    formData,
    sizes,
    complements,
    complementGroups,
    handleBasicInfoChange,
    handleImageUpload,
    handleSizeChange,
    handleComplementsChange,
    handleComplementGroupsChange,
    setFormData
  } = useProductFormState(product);

  const { handleSubmit, loading } = useProductFormSubmit(
    formData,
    sizes,
    complements,
    complementGroups,
    onSubmit,
    product
  );

  const isEditing = !!product;
  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
  const isPizzaCategory = selectedCategory?.categoryType === 'pizza';

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Produto" : "Adicionar Produto"}</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mx-6 flex-wrap">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="images">Imagens</TabsTrigger>
            <TabsTrigger value="sizes">Tamanhos</TabsTrigger>
            <TabsTrigger value="stock">Estoque</TabsTrigger>
            <TabsTrigger value="complements">Complementos</TabsTrigger>
            <TabsTrigger value="complement-groups">Grupos de Complementos</TabsTrigger>
            {isPizzaCategory && (
              <TabsTrigger value="pizza">Opções de Pizza</TabsTrigger>
            )}
          </TabsList>
          
          <CardContent className="space-y-4">
            <TabsContent value="basic">
              <BasicInfoTab 
                formData={formData}
                categories={categories}
                onChange={handleBasicInfoChange}
              />
            </TabsContent>

            <TabsContent value="images">
              <ImagesTab 
                currentImageUrl={formData.image_url || ""}
                onUploadComplete={handleImageUpload}
              />
            </TabsContent>

            <TabsContent value="sizes">
              <SizesTab 
                sizes={sizes}
                onChange={handleSizeChange}
              />
            </TabsContent>

            <TabsContent value="stock">
              <StockTab 
                hasStockControl={formData.hasStockControl || false}
                stockQuantity={formData.stockQuantity || 0}
                onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
              />
            </TabsContent>

            <TabsContent value="complements">
              <ComplementsTab 
                selectedComplements={complements}
                onChange={handleComplementsChange}
              />
            </TabsContent>

            <TabsContent value="complement-groups">
              <ComplementGroupsTab 
                productId={product?.id}
                onChange={handleComplementGroupsChange}
              />
            </TabsContent>

            {isPizzaCategory && (
              <TabsContent value="pizza">
                <PizzaOptionsTab 
                  allowHalfHalf={formData.allow_half_half || false}
                  halfHalfPriceRule={formData.half_half_price_rule || 'highest'}
                  onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                />
              </TabsContent>
            )}
          </CardContent>
        </Tabs>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="bg-primary">
            {loading ? "Salvando..." : (isEditing ? "Atualizar" : "Adicionar")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProductForm;
