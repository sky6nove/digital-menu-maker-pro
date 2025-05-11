
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";
import { useCategories } from "@/hooks/useCategories";
import { Product } from "@/types";
import CategoryTable from "@/components/CategoryTable";
import CategoryForm from "@/components/CategoryForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Categories = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const {
    categories,
    isCategoryFormOpen,
    currentCategory,
    setIsCategoryFormOpen,
    loadCategories,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleSubmitCategory,
    moveUp,
    moveDown
  } = useCategories(user?.id);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load products for reference (needed when deleting categories)
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user?.id);
      
      if (productsError) throw productsError;
      
      const formattedProducts: Product[] = productsData.map(prod => ({
        id: prod.id,
        name: prod.name,
        description: prod.description || "",
        price: prod.price,
        categoryId: prod.category_id || 0,
        isActive: prod.is_active,
        image_url: prod.image_url,
        allow_half_half: prod.allow_half_half || false,
        half_half_price_rule: prod.half_half_price_rule as 'lowest' | 'highest' | 'average' || 'highest',
        pdvCode: prod.pdv_code,
        productTypeId: prod.product_type_id,
        dietaryRestrictions: prod.dietary_restrictions,
        portionSize: prod.portion_size,
        servesCount: prod.serves_count
      }));
      
      setProducts(formattedProducts);
      await loadCategories();
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryDelete = (id: number) => {
    handleDeleteCategory(id, products);
  };

  const handleFormSubmit = async (categoryData: any) => {
    try {
      await handleSubmitCategory(categoryData);
      toast.success(categoryData.id ? "Categoria atualizada" : "Categoria adicionada");
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Erro ao salvar categoria");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthNavbar />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Categorias</h1>
            <p className="text-gray-600">Organize as categorias do seu cardápio</p>
          </div>
          <Button 
            onClick={handleAddCategory} 
            className="bg-primary hover:bg-primary/90"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> Adicionar Categoria
          </Button>
        </div>

        {categories.length > 0 ? (
          <CategoryTable 
            categories={categories} 
            onEdit={handleEditCategory} 
            onDelete={handleCategoryDelete}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
          />
        ) : (
          <div className="text-center py-10 border rounded-md bg-gray-50">
            <p className="text-gray-500">Nenhuma categoria encontrada</p>
            <Button 
              onClick={handleAddCategory} 
              variant="outline" 
              className="mt-4"
            >
              Adicionar sua primeira categoria
            </Button>
          </div>
        )}

        {isCategoryFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md">
              <CategoryForm 
                category={currentCategory} 
                onSubmit={handleFormSubmit}
                onCancel={() => setIsCategoryFormOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
