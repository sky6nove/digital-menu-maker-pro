
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { X } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useComplementGroups } from "@/hooks/useComplementGroups";
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
  const [complements, setComplements] = useState<Array<{id: number, name: string, groupId: number, groupName: string}>>([]);
  
  // State to track which section is active (categories, products, groups, complements)
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [filteredComplements, setFilteredComplements] = useState<any[]>([]);

  // Load all data
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            loadCategories(),
            loadProducts(),
            loadComplementGroups(),
            fetchComplements()
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
    } else {
      setFilteredProducts([]);
    }
  }, [activeCategory, products]);

  // Update filtered complements when activeGroup changes
  useEffect(() => {
    if (activeGroup) {
      setFilteredComplements(complements.filter(c => c.groupId === activeGroup));
    } else {
      setFilteredComplements([]);
    }
  }, [activeGroup, complements]);

  // Fetch complements
  const fetchComplements = async () => {
    try {
      const { data, error } = await supabase
        .from("complements")
        .select("id, name, price, is_active");
        
      if (error) throw error;
      
      // Group complements by their group
      const { data: groupData, error: groupError } = await supabase
        .from("product_complement_groups")
        .select(`
          complement_group_id,
          complement_groups:complement_group_id(name)
        `)
        .order('id');
        
      if (groupError) throw groupError;
      
      // Create a map of complement group IDs to names
      const groupNameMap = new Map();
      groupData.forEach(item => {
        if (item.complement_groups && !groupNameMap.has(item.complement_group_id)) {
          groupNameMap.set(item.complement_group_id, item.complement_groups.name);
        }
      });
      
      // Transform complement data to include group name
      const complementsWithGroup = data.map(comp => ({
        id: comp.id,
        name: comp.name,
        groupId: 0, // Default
        groupName: 'Sem grupo'
      }));
      
      setComplements(complementsWithGroup);
    } catch (error) {
      console.error("Error fetching complements:", error);
      toast.error("Erro ao carregar complementos");
    }
  };

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

  // Handle selecting a category to show its products
  const handleCategorySelect = (categoryId: number) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
    setActiveGroup(null); // Reset group selection when changing category
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

  const activeGroupName = activeGroup 
    ? complementGroups.find(g => g.id === activeGroup)?.name 
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
                  categoryName={activeCategoryName}
                  handleProductMove={handleProductMove}
                />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Complement Groups */}
              <ResizablePanel defaultSize={25}>
                <ComplementGroupPanel 
                  complementGroups={complementGroups}
                  activeGroup={activeGroup}
                  handleGroupSelect={handleGroupSelect}
                />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Complements */}
              <ResizablePanel defaultSize={25}>
                <ComplementPanel 
                  complements={filteredComplements}
                  activeGroup={activeGroup}
                  groupName={activeGroupName}
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
