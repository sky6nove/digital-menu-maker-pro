
import { useState } from "react";
import { Product, Category, ProductSize } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import BasicInfoTab from "./tabs/BasicInfoTab";
import ImagesTab from "./tabs/ImagesTab";
import SizesTab from "./tabs/SizesTab";
import StockTab from "./tabs/StockTab";
import PizzaOptionsTab from "./tabs/PizzaOptionsTab";
import ComplementsTab from "./tabs/ComplementsTab";
import ComplementGroupsTab from "./tabs/ComplementGroupsTab";
import { useProductFormState } from "./hooks/useProductFormState";
import { useProductFormSubmit } from "./hooks/useProductFormSubmit";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (product: Omit<Product, "id"> | Product, sizes?: ProductSize[]) => Promise<Product | undefined>;
  onCancel: () => void;
}

const ProductForm = ({ product, categories, onSubmit, onCancel }: ProductFormProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  
  const {
    formData,
    setFormData,
    sizes,
    setSizes,
    hasMultipleSizes,
    setHasMultipleSizes,
    selectedComplements,
    setSelectedComplements,
    availableComplements,
    setAvailableComplements,
    handleChange,
    handlePriceChange,
    handleCategoryChange,
    handleStatusChange,
    handleHalfHalfChange,
    handleHalfHalfPriceRuleChange,
    handleHasStockControlChange,
    handleStockQuantityChange,
    handleImageUpload,
    handleMultipleSizesChange,
    addSize,
    updateSize,
    removeSize,
    setDefaultSize,
    toggleComplement
  } = useProductFormState(product, categories);

  const {
    handleSubmit,
    loadComplements
  } = useProductFormSubmit({
    formData,
    hasMultipleSizes,
    sizes,
    selectedComplements,
    toast,
    onSubmit
  });

  const isEditing = !!product;
  const showPizzaTab = formData.categoryId && categories.find(c => c.id === formData.categoryId)?.name.toLowerCase().includes("pizza");

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
            <TabsTrigger value="stock">Estoque</TabsTrigger>
            {showPizzaTab && (
              <TabsTrigger value="pizzaOptions">Opções de Pizza</TabsTrigger>
            )}
            <TabsTrigger value="complements">Complementos</TabsTrigger>
            <TabsTrigger value="complementGroups">Grupos de Complemento</TabsTrigger>
          </TabsList>
          
          <CardContent className="space-y-4 pt-4">
            <TabsContent value="basic">
              <BasicInfoTab 
                formData={formData}
                categories={categories}
                hasMultipleSizes={hasMultipleSizes}
                handleChange={handleChange}
                handlePriceChange={handlePriceChange}
                handleCategoryChange={handleCategoryChange}
                handleStatusChange={handleStatusChange}
              />
            </TabsContent>
            
            <TabsContent value="images">
              <ImagesTab 
                currentImageUrl={formData.image_url}
                onUploadComplete={handleImageUpload}
              />
            </TabsContent>
            
            <TabsContent value="sizes">
              <SizesTab 
                hasMultipleSizes={hasMultipleSizes}
                sizes={sizes}
                handleMultipleSizesChange={handleMultipleSizesChange}
                addSize={addSize}
                updateSize={updateSize}
                removeSize={removeSize}
                setDefaultSize={setDefaultSize}
              />
            </TabsContent>
            
            <TabsContent value="stock">
              <StockTab 
                hasStockControl={formData.hasStockControl}
                stockQuantity={formData.stockQuantity}
                handleHasStockControlChange={handleHasStockControlChange}
                handleStockQuantityChange={handleStockQuantityChange}
              />
            </TabsContent>
            
            {showPizzaTab && (
              <TabsContent value="pizzaOptions">
                <PizzaOptionsTab 
                  allowHalfHalf={formData.allow_half_half}
                  halfHalfPriceRule={formData.half_half_price_rule}
                  handleHalfHalfChange={handleHalfHalfChange}
                  handleHalfHalfPriceRuleChange={handleHalfHalfPriceRuleChange}
                />
              </TabsContent>
            )}
            
            <TabsContent value="complements">
              <ComplementsTab 
                availableComplements={availableComplements}
                selectedComplements={selectedComplements}
                toggleComplement={toggleComplement}
                loadComplements={loadComplements}
              />
            </TabsContent>
            
            <TabsContent value="complementGroups">
              <ComplementGroupsTab 
                productId={product?.id}
              />
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
