
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Plus, Download, Eye, ArrowUp, ArrowDown } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import MenuService from "@/services/MenuService";
import ProductForm from "@/components/ProductForm";
import CategoryForm from "@/components/CategoryForm";

const Dashboard = () => {
  const { user } = useAuth();
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
    setCurrentCategory,
    moveUp,
    moveDown
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
        
        {/* Unified Menu Management Interface */}
        <div className="space-y-6">
          {/* Categories Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Organize as categorias do seu cardápio</CardDescription>
              </div>
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Categoria
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                {categories.map((category) => (
                  <div key={category.id} className="border-b last:border-b-0">
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${category.isActive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                          {category.name}
                        </span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {products.filter(p => p.categoryId === category.id).length} produtos
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => moveUp(category.id)}
                          disabled={categories.indexOf(category) === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => moveDown(category.id)}
                          disabled={categories.indexOf(category) === categories.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCategory(category.id, products)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                    
                    {/* Show products in this category */}
                    <div className="bg-muted/30 border-t">
                      {products.filter(p => p.categoryId === category.id).length > 0 ? (
                        products
                          .filter(p => p.categoryId === category.id)
                          .map(product => (
                            <div key={product.id} className="pl-6 pr-3 py-2 border-b last:border-b-0 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className={`${product.isActive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                                  {product.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  R$ {product.price.toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                              <div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  Editar
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="pl-6 pr-3 py-2 text-muted-foreground text-sm italic">
                          Nenhum produto nesta categoria
                        </div>
                      )}
                      <div className="pl-6 pr-3 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                          onClick={() => {
                            setCurrentProduct({
                              id: 0,
                              name: '',
                              description: '',
                              price: 0,
                              categoryId: category.id,
                              isActive: true,
                              image_url: '',
                              allow_half_half: false,
                              half_half_price_rule: 'highest'
                            });
                            setIsProductFormOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar produto nesta categoria
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {categories.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhuma categoria encontrada. Adicione categorias para organizar seus produtos.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Products without category */}
          {products.filter(p => !p.categoryId).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Produtos sem categoria</CardTitle>
                <CardDescription>Produtos que não estão em nenhuma categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  {products
                    .filter(p => !p.categoryId)
                    .map(product => (
                      <div key={product.id} className="p-3 border-b last:border-b-0 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`${product.isActive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                            {product.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Add new product button */}
          <div className="flex justify-center">
            <Button onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Novo Produto
            </Button>
          </div>
        </div>
        
        {/* Product Form Dialog */}
        <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogTitle>
              {currentProduct?.id ? 'Editar Produto' : 'Adicionar Produto'}
            </DialogTitle>
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
            <DialogTitle>
              {currentCategory?.id ? 'Editar Categoria' : 'Adicionar Categoria'}
            </DialogTitle>
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
