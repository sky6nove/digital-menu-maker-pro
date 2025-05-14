
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AuthNavbar from "@/components/AuthNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import ProductForm from "@/components/ProductForm";

const ProductEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams();
  const [loading, setLoading] = useState(true);
  
  // Use our custom hooks for products and categories
  const {
    products,
    currentProduct,
    loadProducts,
    handleSubmitProduct,
    setCurrentProduct
  } = useProducts(user?.id);

  const {
    categories,
    loadCategories,
  } = useCategories(user?.id);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && products.length > 0 && productId) {
      const product = products.find(p => p.id === parseInt(productId));
      if (product) {
        setCurrentProduct(product);
      } else {
        // Product not found
        toast.error("Produto não encontrado");
        navigate("/dashboard");
      }
    } else if (!loading && productId === "new") {
      // Creating a new product
      setCurrentProduct({
        id: 0,
        name: '',
        description: '',
        price: 0,
        categoryId: categories.length > 0 ? categories[0].id : 0,
        isActive: true,
        image_url: '',
        allow_half_half: false,
        half_half_price_rule: 'highest',
        hasStockControl: false,
        stockQuantity: 0
      });
    }
  }, [loading, products, productId]);

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

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleSubmit = async (productData, sizes) => {
    const result = await handleSubmitProduct(productData, sizes);
    if (result) {
      toast.success(productData.id ? "Produto atualizado com sucesso" : "Produto adicionado com sucesso");
      navigate("/dashboard");
    }
    return result;
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
            <h1 className="text-3xl font-bold tracking-tight">
              {currentProduct?.id ? 'Editar Produto' : 'Adicionar Produto'}
            </h1>
            <p className="text-muted-foreground">
              {currentProduct?.id ? 'Edite as informações do produto' : 'Adicione um novo produto ao cardápio'}
            </p>
          </div>
          
          <Button variant="outline" onClick={handleCancel}>
            Voltar para o dashboard
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            {currentProduct && (
              <ProductForm
                product={currentProduct}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProductEdit;
