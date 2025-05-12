
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash, Package, CircleCheck, CircleX, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Complement, ComplementItem, Product } from "@/types";
import ComplementForm from "@/components/ComplementForm";

interface ComplementsListProps {
  groupId: number;
  groupName: string;
}

const ComplementsList = ({ groupId, groupName }: ComplementsListProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complementItems, setComplementItems] = useState<ComplementItem[]>([]);
  const [currentComplement, setCurrentComplement] = useState<Complement | undefined>(undefined);
  const [isComplementFormOpen, setIsComplementFormOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (user && groupId) {
      loadComplementItems();
      loadProducts();
    }
  }, [user, groupId]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user?.id);
        
      if (error) throw error;
      
      // Transform to match our interface
      const formattedProducts: Product[] = data.map(prod => ({
        id: prod.id,
        name: prod.name,
        description: prod.description || "",
        price: prod.price,
        categoryId: prod.category_id || 0,
        isActive: prod.is_active,
        image_url: prod.image_url || ""
      }));
      
      setProducts(formattedProducts);
    } catch (error: any) {
      console.error("Error loading products:", error);
    }
  };

  const loadComplementItems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("complement_items")
        .select("*, product:product_id(*)")
        .eq("group_id", groupId);
        
      if (error) throw error;
      
      // Transform to match our interface
      const formattedItems: ComplementItem[] = data.map(item => ({
        id: item.id,
        groupId: item.group_id,
        name: item.name,
        price: item.price || 0,
        isActive: item.is_active,
        productId: item.product_id || undefined,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description || "",
          price: item.product.price,
          categoryId: item.product.category_id || 0,
          isActive: item.product.is_active,
          image_url: item.product.image_url || ""
        } : undefined
      }));
      
      setComplementItems(formattedItems);
    } catch (error: any) {
      toast.error("Erro ao carregar complementos");
      console.error("Error loading complements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComplement = () => {
    setCurrentComplement(undefined);
    setIsComplementFormOpen(true);
  };

  const handleEditComplement = (complement: Complement) => {
    setCurrentComplement(complement);
    setIsComplementFormOpen(true);
  };

  const handleDeleteComplement = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este complemento?")) {
      try {
        const { error } = await supabase
          .from("complement_items")
          .delete()
          .eq("id", id);
          
        if (error) throw error;
        
        toast.success("Complemento excluído com sucesso");
        loadComplementItems();
      } catch (error: any) {
        toast.error("Erro ao excluir complemento");
        console.error("Error deleting complement:", error);
      }
    }
  };

  const handleSubmitComplement = async (complementData: Omit<Complement, "id"> | Complement) => {
    try {
      if ("id" in complementData && complementData.id > 0) {
        // Update existing complement
        const { error } = await supabase
          .from("complement_items")
          .update({
            name: complementData.name,
            price: complementData.price,
            is_active: complementData.isActive,
            updated_at: new Date().toISOString()
          })
          .eq("id", complementData.id);
          
        if (error) throw error;
        
        toast.success("Complemento atualizado com sucesso");
      } else {
        // Create new complement
        const { error } = await supabase
          .from("complement_items")
          .insert({
            name: complementData.name,
            price: complementData.price,
            is_active: complementData.isActive,
            group_id: groupId
          });
          
        if (error) throw error;
        
        toast.success("Complemento adicionado com sucesso");
      }
      
      setIsComplementFormOpen(false);
      loadComplementItems();
    } catch (error: any) {
      toast.error("Erro ao salvar complemento");
      console.error("Error saving complement:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando complementos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Complementos para "{groupName}"</CardTitle>
          </div>
          <Button onClick={handleAddComplement}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Complemento
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {complementItems.map(item => (
              <Card key={item.id} className={`${!item.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">{item.name}</h3>
                        {item.productId && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-700">
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            Produto
                          </Badge>
                        )}
                      </div>
                      <p className="text-primary font-medium">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                      
                      <div className="flex gap-2 mt-2">
                        {!item.isActive && (
                          <Badge variant="outline" className="bg-gray-200 text-gray-700">
                            Inativo
                          </Badge>
                        )}
                        
                        {item.product && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700">
                            Produto vinculado
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {item.product?.image_url && (
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={item.product.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <div className="flex items-center">
                      {item.isActive ? (
                        <span className="text-green-500 flex items-center text-sm">
                          <CircleCheck className="h-4 w-4 mr-1" />
                          Ativo
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center text-sm">
                          <CircleX className="h-4 w-4 mr-1" />
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditComplement(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteComplement(item.id)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {complementItems.length === 0 && (
              <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Nenhum complemento encontrado para este grupo.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleAddComplement}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar seu primeiro complemento
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isComplementFormOpen} onOpenChange={setIsComplementFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>
            {currentComplement ? 'Editar Complemento' : 'Adicionar Complemento'}
          </DialogTitle>
          <ComplementForm
            complement={currentComplement}
            onSubmit={handleSubmitComplement}
            onCancel={() => setIsComplementFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplementsList;
