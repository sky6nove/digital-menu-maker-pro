import { useState, useEffect } from "react";
import { Product, Category, ProductSize } from "@/types";
import { toast } from "sonner";
import MenuExporter from "@/services/MenuExporter";
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
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(undefined);
  const [currentCategory, setCurrentCategory] = useState<Category | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user?.id);
      
      if (categoriesError) throw categoriesError;
      
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user?.id);
      
      if (productsError) throw productsError;
      
      // Transform to match our existing interfaces
      const formattedCategories: Category[] = categoriesData.map(cat => ({
        id: cat.id,
        name: cat.name,
        isActive: cat.is_active
      }));
      
      const formattedProducts: Product[] = productsData.map(prod => ({
        id: prod.id,
        name: prod.name,
        description: prod.description || "",
        price: prod.price,
        categoryId: prod.category_id || 0,
        isActive: prod.is_active,
        image_url: prod.image_url,
        allow_half_half: prod.allow_half_half || false,
        half_half_price_rule: prod.half_half_price_rule as 'lowest' | 'highest' | 'average' || 'highest'
      }));
      
      setCategories(formattedCategories);
      setProducts(formattedProducts);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
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
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", id)
          .eq("user_id", user?.id);
          
        if (error) throw error;
        toast.success("Produto excluído com sucesso");
        loadData();
      } catch (error: any) {
        toast.error("Erro ao excluir produto");
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleSubmitProduct = async (productData: Omit<Product, "id"> | Product, sizes?: ProductSize[]): Promise<Product | undefined> => {
    try {
      if ("id" in productData && productData.id > 0) {
        // Update existing product
        const { data, error } = await supabase
          .from("products")
          .update({
            name: productData.name,
            description: productData.description || null,
            price: productData.price,
            category_id: productData.categoryId || null,
            is_active: productData.isActive,
            image_url: productData.image_url || null,
            allow_half_half: productData.allow_half_half || false,
            half_half_price_rule: productData.half_half_price_rule || 'highest',
            updated_at: new Date().toISOString()
          })
          .eq("id", productData.id)
          .eq("user_id", user?.id)
          .select()
          .single();
          
        if (error) throw error;
        
        // Update or insert sizes if provided
        if (sizes && sizes.length > 0) {
          // First delete existing sizes
          const { error: deleteSizesError } = await supabase
            .from("product_sizes")
            .delete()
            .eq("product_id", productData.id);
            
          if (deleteSizesError) throw deleteSizesError;
          
          // Then insert new sizes
          const sizesToInsert = sizes.map(size => ({
            product_id: productData.id,
            name: size.name,
            price: size.price,
            is_default: size.is_default
          }));
          
          const { error: insertSizesError } = await supabase
            .from("product_sizes")
            .insert(sizesToInsert);
            
          if (insertSizesError) throw insertSizesError;
        }
        
        toast.success("Produto atualizado com sucesso");
        
        // Map database format to our interface
        const updatedProduct: Product = {
          id: data.id,
          name: data.name,
          description: data.description || "",
          price: data.price,
          categoryId: data.category_id || 0,
          isActive: data.is_active,
          image_url: data.image_url,
          allow_half_half: data.allow_half_half || false,
          half_half_price_rule: data.half_half_price_rule as 'lowest' | 'highest' | 'average' || 'highest'
        };
        
        return updatedProduct;
      } else {
        // Create new product
        const { data, error } = await supabase
          .from("products")
          .insert({
            name: productData.name,
            description: productData.description || null,
            price: productData.price,
            category_id: productData.categoryId || null,
            is_active: productData.isActive,
            image_url: productData.image_url || null,
            allow_half_half: productData.allow_half_half || false,
            half_half_price_rule: productData.half_half_price_rule || 'highest',
            user_id: user?.id
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Insert sizes if provided
        if (sizes && sizes.length > 0) {
          const sizesToInsert = sizes.map(size => ({
            product_id: data.id,
            name: size.name,
            price: size.price,
            is_default: size.is_default
          }));
          
          const { error: insertSizesError } = await supabase
            .from("product_sizes")
            .insert(sizesToInsert);
            
          if (insertSizesError) throw insertSizesError;
        }
        
        toast.success("Produto adicionado com sucesso");
        
        // Map database format to our interface
        const newProduct: Product = {
          id: data.id,
          name: data.name,
          description: data.description || "",
          price: data.price,
          categoryId: data.category_id || 0,
          isActive: data.is_active,
          image_url: data.image_url,
          allow_half_half: data.allow_half_half || false,
          half_half_price_rule: data.half_half_price_rule as 'lowest' | 'highest' | 'average' || 'highest'
        };
        
        setIsProductFormOpen(false);
        loadData();
        return newProduct;
      }
    } catch (error: any) {
      toast.error("Erro ao salvar produto");
      console.error("Error saving product:", error);
      return undefined;
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
        const { error } = await supabase
          .from("categories")
          .delete()
          .eq("id", id)
          .eq("user_id", user?.id);
          
        if (error) throw error;
        toast.success("Categoria excluída com sucesso");
        loadData();
      } catch (error: any) {
        toast.error("Erro ao excluir categoria");
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleSubmitCategory = async (categoryData: Omit<Category, "id"> | Category) => {
    try {
      if ("id" in categoryData && categoryData.id > 0) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            name: categoryData.name,
            is_active: categoryData.isActive,
            updated_at: new Date().toISOString()
          })
          .eq("id", categoryData.id)
          .eq("user_id", user?.id);
          
        if (error) throw error;
        toast.success("Categoria atualizada com sucesso");
      } else {
        // Create new category
        const { error } = await supabase
          .from("categories")
          .insert({
            name: categoryData.name,
            is_active: categoryData.isActive,
            user_id: user?.id
          });
          
        if (error) throw error;
        toast.success("Categoria adicionada com sucesso");
      }
      setIsCategoryFormOpen(false);
      loadData();
    } catch (error: any) {
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
