
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash, Package, CircleCheck, CircleX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Complement } from "@/types";
import ComplementForm from "@/components/ComplementForm";

interface ComplementsListProps {
  groupId: number;
  groupName: string;
}

const ComplementsList = ({ groupId, groupName }: ComplementsListProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complements, setComplements] = useState<Complement[]>([]);
  const [currentComplement, setCurrentComplement] = useState<Complement | undefined>(undefined);
  const [isComplementFormOpen, setIsComplementFormOpen] = useState(false);

  useEffect(() => {
    if (user && groupId) {
      loadComplements();
    }
  }, [user, groupId]);

  const loadComplements = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("complements")
        .select("*")
        .eq("user_id", user?.id);
        
      if (error) throw error;
      
      // Transform to match our interface
      const formattedComplements: Complement[] = data.map(comp => ({
        id: comp.id,
        name: comp.name,
        price: comp.price,
        isActive: comp.is_active,
        image_url: comp.image_url || undefined,
        hasStockControl: comp.has_stock_control || false,
        stockQuantity: comp.stock_quantity || 0
      }));
      
      setComplements(formattedComplements);
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
          .from("complements")
          .delete()
          .eq("id", id)
          .eq("user_id", user?.id);
          
        if (error) throw error;
        
        toast.success("Complemento excluído com sucesso");
        loadComplements();
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
          .from("complements")
          .update({
            name: complementData.name,
            price: complementData.price,
            is_active: complementData.isActive,
            image_url: complementData.image_url || null,
            has_stock_control: complementData.hasStockControl || false,
            stock_quantity: complementData.stockQuantity || 0,
            updated_at: new Date().toISOString()
          })
          .eq("id", complementData.id)
          .eq("user_id", user?.id);
          
        if (error) throw error;
        
        toast.success("Complemento atualizado com sucesso");
      } else {
        // Create new complement
        const { error } = await supabase
          .from("complements")
          .insert({
            name: complementData.name,
            price: complementData.price,
            is_active: complementData.isActive,
            image_url: complementData.image_url || null,
            has_stock_control: complementData.hasStockControl || false,
            stock_quantity: complementData.stockQuantity || 0,
            user_id: user?.id
          });
          
        if (error) throw error;
        
        toast.success("Complemento adicionado com sucesso");
      }
      
      setIsComplementFormOpen(false);
      loadComplements();
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
            {complements.map(complement => (
              <Card key={complement.id} className={`${!complement.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{complement.name}</h3>
                      <p className="text-primary font-medium">
                        R$ {complement.price.toFixed(2).replace('.', ',')}
                      </p>
                      
                      <div className="flex gap-2 mt-2">
                        {!complement.isActive && (
                          <Badge variant="outline" className="bg-gray-200 text-gray-700">
                            Inativo
                          </Badge>
                        )}
                        
                        {complement.hasStockControl && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700">
                            <Package className="h-3 w-3 mr-1" />
                            Estoque: {complement.stockQuantity}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {complement.image_url && (
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={complement.image_url} 
                          alt={complement.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <div className="flex items-center">
                      {complement.isActive ? (
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
                        onClick={() => handleEditComplement(complement)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteComplement(complement.id)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {complements.length === 0 && (
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
