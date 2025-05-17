import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { X } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useComplementGroups } from "@/hooks/useComplementGroups";
import { useProductComplementGroups } from "@/hooks/useProductComplementGroups";
import { useGroupComplements } from "@/hooks/useGroupComplements";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import {
  CategoryPanel,
  ProductPanel,
  ComplementGroupPanel,
  ComplementPanel
} from "@/components/reorderMenu";

const ReorderMenu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { products, loadProducts } = useProducts(user?.id);
  const { categories, loadCategories } = useCategories(user?.id);
  const { complementGroups, loadComplementGroups } = useComplementGroups();
  const { fetchComplementGroupsByProduct } = useProductComplementGroups();
  const { fetchComplementsByGroup } = useGroupComplements();
  
  // State to track which section is active (categories, products, groups, complements)
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeProduct, setActiveProduct] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [productGroups, setProductGroups] = useState<any[]>([]);
  const [groupComplements, setGroupComplements] = useState<any[]>([]);

  // Load all data
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            loadCategories(),
            loadProducts(),
            loadComplementGroups()
          ]);
        } catch (error) {
          toast.error("Erro ao carregar dados");
          console.error("Error loading data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  // Update filtered products when activeCategory changes
  useEffect(() => {
    if (activeCategory) {
      setFilteredProducts(products.filter(p => p.categoryId === activeCategory));
      setActiveProduct(null); // Reset product selection
      setActiveGroup(null); // Reset group selection
      setProductGroups([]); // Clear product groups
      setGroupComplements([]); // Clear group complements
    } else {
      setFilteredProducts([]);
    }
  }, [activeCategory, products]);

  // Load product complement groups when a product is selected
  useEffect(() => {
    const loadProductGroups = async () => {
      if (activeProduct) {
        const groups = await fetchComplementGroupsByProduct(activeProduct);
        setProductGroups(groups);
      } else {
        setProductGroups([]);
      }
      setActiveGroup(null); // Reset group selection
      setGroupComplements([]); // Clear group complements
    };

    loadProductGroups();
  }, [activeProduct]);

  // Load complements when a group is selected
  useEffect(() => {
    const loadGroupComplements = async () => {
      if (activeGroup) {
        const complements = await fetchComplementsByGroup(activeGroup);
        setGroupComplements(complements);
      } else {
        setGroupComplements([]);
      }
    };

    loadGroupComplements();
  }, [activeGroup]);

  // Handle reordering for products
  const handleProductMove = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = products.findIndex(p => p.id === id);
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= products.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    try {
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetProduct = products[targetIndex];
      
      // Get the current display_order values, default to their array indices if undefined
      const currentDisplayOrder = products[currentIndex].display_order ?? currentIndex;
      const targetDisplayOrder = targetProduct.display_order ?? targetIndex;
      
      // Swap display_order values
      const { error: updateError } = await supabase
        .from("products")
        .update({ display_order: targetDisplayOrder })
        .eq("id", id);
        
      if (updateError) throw updateError;
      
      const { error: updateTargetError } = await supabase
        .from("products")
        .update({ display_order: currentDisplayOrder })
        .eq("id", targetProduct.id);
        
      if (updateTargetError) throw updateTargetError;
      
      await loadProducts(); // Reload products
      toast.success("Ordem atualizada");
    } catch (error) {
      console.error("Error updating product order:", error);
      toast.error("Erro ao atualizar ordem");
    }
  };

  // Handle reordering for categories
  const handleCategoryMove = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === id);
    if (
      (direction === 'up' && currentIndex <= 0) || 
      (direction === 'down' && currentIndex >= categories.length - 1)
    ) {
      return; // Already at top/bottom
    }
    
    try {
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetCategory = categories[targetIndex];
      
      // Use the swapCategoriesOrder method from CategoryService
      await supabase
        .from("categories")
        .update({ order: targetCategory.order })
        .eq("id", id);
        
      await supabase
        .from("categories")
        .update({ order: categories[currentIndex].order })
        .eq("id", targetCategory.id);
      
      await loadCategories(); // Reload categories
      toast.success("Ordem atualizada");
    } catch (error) {
      console.error("Error updating category order:", error);
      toast.error("Erro ao atualizar ordem");
    }
  };

  // Handle reordering for complement groups
  const handleGroupMove = async (id: number, direction: 'up' | 'down') => {
    // This would implement reordering of complement groups
    toast.info("Reordenação de grupos de complementos será implementada em breve");
  };

  // Handle reordering for complements
  const handleComplementMove = async (id: number, direction: 'up' | 'down') => {
    // This would implement reordering of complements
    toast.info("Reordenação de complementos será implementada em breve");
  };

  // Handle selecting a category to show its products
  const handleCategorySelect = (categoryId: number) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
    setActiveProduct(null); // Reset product selection when changing category
    setActiveGroup(null); // Reset group selection when changing category
  };

  // Handle selecting a product to show its complement groups
  const handleProductSelect = (productId: number) => {
    setActiveProduct(activeProduct === productId ? null : productId);
    setActiveGroup(null); // Reset group selection when changing product
  };

  // Handle selecting a group to show its complements
  const handleGroupSelect = (groupId: number) => {
    setActiveGroup(activeGroup === groupId ? null : groupId);
  };

  // Handle close
  const handleClose = () => {
    navigate('/dashboard');
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    toast.success("Ordem salva com sucesso");
    setSaving(false);
    navigate('/dashboard');
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

  const activeCategoryName = activeCategory 
    ? categories.find(c => c.id === activeCategory)?.name 
    : '';

  const activeProductName = activeProduct
    ? products.find(p => p.id === activeProduct)?.name
    : '';

  const activeGroupName = activeGroup 
    ? productGroups.find(g => g.id === activeGroup)?.name 
    : '';

  return (
    <div className="min-h-screen flex flex-col">
      <AuthNavbar />
      
      <main className="flex-1 container py-6">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle>Reordenar cardápio</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-6">
              Para alterar a ordem dos itens ou categorias do seu cardápio, clique na opção desejada, segure e arraste.
            </p>
            
            <ResizablePanelGroup direction="horizontal" className="min-h-[500px] border rounded-lg">
              {/* Categories */}
              <ResizablePanel defaultSize={25}>
                <CategoryPanel 
                  categories={categories}
                  activeCategory={activeCategory}
                  handleCategorySelect={handleCategorySelect}
                  handleCategoryMove={handleCategoryMove}
                />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Products */}
              <ResizablePanel defaultSize={25}>
                <ProductPanel 
                  products={filteredProducts}
                  activeCategory={activeCategory}
                  activeProduct={activeProduct}
                  categoryName={activeCategoryName}
                  handleProductSelect={handleProductSelect}
                  handleProductMove={handleProductMove}
                />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Complement Groups */}
              <ResizablePanel defaultSize={25}>
                <ComplementGroupPanel 
                  complementGroups={productGroups}
                  activeProduct={activeProduct}
                  activeGroup={activeGroup}
                  productName={activeProductName}
                  handleGroupSelect={handleGroupSelect}
                  handleGroupMove={handleGroupMove}
                />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Complements */}
              <ResizablePanel defaultSize={25}>
                <ComplementPanel 
                  complements={groupComplements}
                  activeGroup={activeGroup}
                  groupName={activeGroupName}
                  handleComplementMove={handleComplementMove}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReorderMenu;
