
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { ArrowLeft } from 'lucide-react';

interface ProductWithOrder {
  id: number;
  name: string;
  category_id: number;
  display_order: number;
}

interface Category {
  id: number;
  name: string;
}

const ProductOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCategory !== null) {
      loadProductsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('order');

      if (error) throw error;
      setCategories(data || []);
      
      if (data && data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByCategory = async (categoryId: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category_id, display_order')
        .eq('user_id', user?.id)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      
      // Ensure all products have a display_order
      const productsWithOrder = (data || []).map((product, index) => ({
        ...product,
        display_order: product.display_order || index + 1
      }));
      
      setProducts(productsWithOrder);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update display_order for each product based on new position
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));
    
    setProducts(updatedItems);
  };

  const saveProductOrder = async () => {
    if (!selectedCategory) return;
    
    try {
      setSaving(true);
      
      // Update each product with its new display_order
      for (const product of products) {
        const { error } = await supabase
          .from('products')
          .update({ display_order: product.display_order })
          .eq('id', product.id)
          .eq('user_id', user?.id);
          
        if (error) throw error;
      }
      
      toast.success('Ordem dos produtos salva com sucesso!');
    } catch (error) {
      console.error('Error saving product order:', error);
      toast.error('Erro ao salvar a ordem dos produtos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/menu')}
            className="mr-4"
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-bold">Reordenar Produtos</h1>
        </div>
        
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className="justify-start"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Produtos</CardTitle>
                <Button 
                  onClick={saveProductOrder}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar ordem'}
                </Button>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum produto encontrado nesta categoria.
                  </p>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="products">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {products.map((product, index) => (
                            <Draggable 
                              key={product.id.toString()} 
                              draggableId={product.id.toString()} 
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="p-4 bg-white rounded-md border shadow-sm flex items-center"
                                >
                                  <div className="mr-3 text-gray-400 text-sm">
                                    {index + 1}
                                  </div>
                                  <div>
                                    {product.name}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductOrder;
