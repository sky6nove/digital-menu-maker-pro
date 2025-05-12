
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AuthNavbar from "@/components/AuthNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Image, Edit, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ComplementGroup } from "@/types";
import ComplementGroupForm from "@/components/ComplementGroupForm";
import ComplementsList from "@/components/ComplementsList";

const ComplementGroups = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complementGroups, setComplementGroups] = useState<ComplementGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<ComplementGroup | undefined>(undefined);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadComplementGroups();
    }
  }, [user]);

  const loadComplementGroups = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("complement_groups")
        .select("*")
        .eq("user_id", user?.id);
        
      if (error) throw error;
      
      // Transform to match our interface
      const formattedGroups: ComplementGroup[] = data.map(group => ({
        id: group.id,
        name: group.name,
        groupType: group.group_type as 'ingredients' | 'specifications' | 'cross_sell' | 'disposables',
        isActive: group.is_active,
        imageUrl: group.image_url || undefined,
        minimumQuantity: group.minimum_quantity || 0,
        maximumQuantity: group.maximum_quantity || 0,
        isRequired: group.is_required || false
      }));
      
      setComplementGroups(formattedGroups);
    } catch (error: any) {
      toast.error("Erro ao carregar grupos de complementos");
      console.error("Error loading complement groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = () => {
    setCurrentGroup(undefined);
    setIsGroupFormOpen(true);
  };

  const handleEditGroup = (group: ComplementGroup) => {
    setCurrentGroup(group);
    setIsGroupFormOpen(true);
  };

  const handleDeleteGroup = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este grupo?")) {
      try {
        const { error } = await supabase
          .from("complement_groups")
          .delete()
          .eq("id", id)
          .eq("user_id", user?.id);
          
        if (error) throw error;
        
        toast.success("Grupo excluído com sucesso");
        loadComplementGroups();
      } catch (error: any) {
        toast.error("Erro ao excluir grupo");
        console.error("Error deleting complement group:", error);
      }
    }
  };

  const handleSubmitGroup = async (groupData: Omit<ComplementGroup, "id"> | ComplementGroup) => {
    try {
      if ("id" in groupData && groupData.id > 0) {
        // Update existing group
        const { error } = await supabase
          .from("complement_groups")
          .update({
            name: groupData.name,
            group_type: groupData.groupType,
            is_active: groupData.isActive,
            image_url: groupData.imageUrl || null,
            minimum_quantity: groupData.minimumQuantity || 0,
            maximum_quantity: groupData.maximumQuantity || 0,
            is_required: groupData.isRequired || false,
            updated_at: new Date().toISOString()
          })
          .eq("id", groupData.id)
          .eq("user_id", user?.id);
          
        if (error) throw error;
        
        toast.success("Grupo atualizado com sucesso");
      } else {
        // Create new group
        const { error } = await supabase
          .from("complement_groups")
          .insert({
            name: groupData.name,
            group_type: groupData.groupType,
            is_active: groupData.isActive,
            image_url: groupData.imageUrl || null,
            minimum_quantity: groupData.minimumQuantity || 0,
            maximum_quantity: groupData.maximumQuantity || 0,
            is_required: groupData.isRequired || false,
            user_id: user?.id
          });
          
        if (error) throw error;
        
        toast.success("Grupo adicionado com sucesso");
      }
      
      setIsGroupFormOpen(false);
      loadComplementGroups();
    } catch (error: any) {
      toast.error("Erro ao salvar grupo");
      console.error("Error saving complement group:", error);
    }
  };

  const handleViewComplements = (groupId: number) => {
    setSelectedGroupId(groupId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando grupos de complementos...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Grupos de Complementos</h1>
            <p className="text-muted-foreground">Gerencie grupos de complementos para seus produtos</p>
          </div>
          
          <Button onClick={handleAddGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Grupo
          </Button>
        </div>
        
        {selectedGroupId === null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complementGroups.map(group => (
              <Card key={group.id} className={`${!group.isActive ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{group.name}</CardTitle>
                      <CardDescription>
                        Tipo: {group.groupType === 'ingredients' ? 'Ingredientes' : 
                              group.groupType === 'specifications' ? 'Especificações' :
                              group.groupType === 'cross_sell' ? 'Venda cruzada' : 'Descartáveis'}
                      </CardDescription>
                      {(group.minimumQuantity > 0 || group.maximumQuantity > 0 || group.isRequired) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {group.isRequired && (
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 border-red-200">
                              Obrigatório
                            </span>
                          )}
                          {group.minimumQuantity > 0 && (
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200">
                              Min: {group.minimumQuantity}
                            </span>
                          )}
                          {group.maximumQuantity > 0 && (
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-green-200">
                              Max: {group.maximumQuantity}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {group.imageUrl && (
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={group.imageUrl} 
                          alt={group.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {!group.imageUrl && (
                      <div className="w-12 h-12 rounded-md flex items-center justify-center bg-gray-100">
                        <Image className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewComplements(group.id)}
                    >
                      Ver Complementos
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditGroup(group)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {complementGroups.length === 0 && (
              <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Nenhum grupo de complemento encontrado.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleAddGroup}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar seu primeiro grupo
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={() => setSelectedGroupId(null)}
            >
              Voltar para grupos
            </Button>
            
            <ComplementsList 
              groupId={selectedGroupId} 
              groupName={complementGroups.find(g => g.id === selectedGroupId)?.name || ""}
            />
          </div>
        )}
        
        <Dialog open={isGroupFormOpen} onOpenChange={setIsGroupFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogTitle>
              {currentGroup ? 'Editar Grupo de Complementos' : 'Adicionar Grupo de Complementos'}
            </DialogTitle>
            <ComplementGroupForm
              group={currentGroup}
              onSubmit={handleSubmitGroup}
              onCancel={() => setIsGroupFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ComplementGroups;
