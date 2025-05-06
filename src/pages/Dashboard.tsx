
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ProductTable from "@/components/ProductTable";
import ProductForm from "@/components/ProductForm";
import CategoryTable from "@/components/CategoryTable";
import CategoryForm from "@/components/CategoryForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Download, Eye } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import MenuService from "@/services/MenuService";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(true);

  // Use our custom hooks for products and categories
  const {
    products,
    currentProduct,
    isProductFormOpen,
    setIsProductFormOpen,
    loadProducts,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleSubmitProduct,
    setCurrentProduct
  } = useProducts(user?.id);

  const {
    categories,
    currentCategory,
    isCategoryFormOpen,
    setIsCategoryFormOpen,
    loadCategories,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleSubmitCategory,
    setCurrentCategory
  } = useCategories(user?.id);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadCategories(), loadProducts()]);
    } catch (error) {
      toast.error("Erro ao carregar dados");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Menu export handlers are now in MenuService
  const handleExportMenu = () => MenuService.exportMenu(products, categories);
  const handlePreviewMenu = () => MenuService.previewMenu();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthNavbar />
      
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
                  onDelete={(id) => handleDeleteCategory(id, products)}
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
