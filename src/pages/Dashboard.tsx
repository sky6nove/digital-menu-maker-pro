
import { useState, useEffect } from "react";
import { Product, Category } from "@/types";
import { ProductService, CategoryService } from "@/services/MockDataService";
import MenuExporter from "@/services/MenuExporter";
import Navbar from "@/components/Navbar";
import ProductTable from "@/components/ProductTable";
import ProductForm from "@/components/ProductForm";
import CategoryTable from "@/components/CategoryTable";
import CategoryForm from "@/components/CategoryForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Download, Eye } from "lucide-react";

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(undefined);
  const [currentCategory, setCurrentCategory] = useState<Category | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const productsData = await ProductService.getAllProducts();
      const categoriesData = await CategoryService.getAllCategories();
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Erro ao carregar dados");
      console.error("Error loading data:", error);
    }
  };

  // Product handlers
  const handleAddProduct = () => {
    setCurrentProduct(undefined);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await ProductService.deleteProduct(id);
        toast.success("Produto excluído com sucesso");
        loadData();
      } catch (error) {
        toast.error("Erro ao excluir produto");
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleSubmitProduct = async (productData: Omit<Product, "id"> | Product) => {
    try {
      if ("id" in productData && productData.id > 0) {
        // Update existing product
        await ProductService.updateProduct(productData.id, productData);
        toast.success("Produto atualizado com sucesso");
      } else {
        // Create new product
        await ProductService.createProduct(productData);
        toast.success("Produto adicionado com sucesso");
      }
      setIsProductFormOpen(false);
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar produto");
      console.error("Error saving product:", error);
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    setCurrentCategory(undefined);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategory = async (id: number) => {
    // Check if category is being used
    const productsUsingCategory = products.filter(p => p.categoryId === id);
    
    if (productsUsingCategory.length > 0) {
      toast.error("Não é possível excluir esta categoria pois está sendo usada por produtos");
      return;
    }
    
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      try {
        await CategoryService.deleteCategory(id);
        toast.success("Categoria excluída com sucesso");
        loadData();
      } catch (error) {
        toast.error("Erro ao excluir categoria");
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleSubmitCategory = async (categoryData: Omit<Category, "id"> | Category) => {
    try {
      if ("id" in categoryData && categoryData.id > 0) {
        // Update existing category
        await CategoryService.updateCategory(categoryData.id, categoryData);
        toast.success("Categoria atualizada com sucesso");
      } else {
        // Create new category
        await CategoryService.createCategory(categoryData);
        toast.success("Categoria adicionada com sucesso");
      }
      setIsCategoryFormOpen(false);
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar categoria");
      console.error("Error saving category:", error);
    }
  };

  // Menu export handlers
  const handleExportMenu = async () => {
    try {
      const html = await MenuExporter.generateMenuHTML(products, categories);
      MenuExporter.downloadHTML(html, "cardapio-digital.html");
      toast.success("Cardápio exportado com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar cardápio");
      console.error("Error exporting menu:", error);
    }
  };

  const handlePreviewMenu = () => {
    window.open("/menu", "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciador de Cardápio Digital</h1>
            <p className="text-muted-foreground">Mantenha seu cardápio sempre atualizado</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleExportMenu} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Cardápio
            </Button>
            <Button onClick={handlePreviewMenu}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar Cardápio
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="settings" disabled>Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>Gerencie os produtos do seu cardápio</CardDescription>
                </div>
                <Button onClick={handleAddProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </CardHeader>
              <CardContent>
                <ProductTable
                  products={products}
                  categories={categories}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Categorias</CardTitle>
                  <CardDescription>Gerencie as categorias do seu cardápio</CardDescription>
                </div>
                <Button onClick={handleAddCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Categoria
                </Button>
              </CardHeader>
              <CardContent>
                <CategoryTable
                  categories={categories}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Product Form Dialog */}
        <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <ProductForm
              product={currentProduct}
              categories={categories}
              onSubmit={handleSubmitProduct}
              onCancel={() => setIsProductFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        {/* Category Form Dialog */}
        <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <CategoryForm
              category={currentCategory}
              onSubmit={handleSubmitCategory}
              onCancel={() => setIsCategoryFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Dashboard;
