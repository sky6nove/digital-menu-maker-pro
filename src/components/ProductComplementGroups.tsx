
import React, { useState } from "react";
import { ComplementGroup, ProductComplementGroup, Complement } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Edit, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProductComplementGroupsProps {
  availableGroups: ComplementGroup[];
  selectedGroups: ProductComplementGroup[];
  productId?: number;
  onAddGroup: (groupId: number, isRequired: boolean) => void;
  onRemoveGroup: (groupId: number) => void;
  onUpdateRequired: (groupId: number, isRequired: boolean) => void;
}

interface ProductSpecificComplement {
  id: number;
  productId: number;
  complementGroupId: number;
  complementId: number;
  isActive: boolean;
  customPrice: number | null;
  complementName: string;
  complementDefaultPrice: number;
}

const ProductComplementGroups = ({
  availableGroups,
  selectedGroups,
  productId,
  onAddGroup,
  onRemoveGroup,
  onUpdateRequired
}: ProductComplementGroupsProps) => {
  const { user } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("");
  const [isRequired, setIsRequired] = React.useState(false);
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [specificComplements, setSpecificComplements] = useState<ProductSpecificComplement[]>([]);
  const [loading, setLoading] = useState(false);
  
  const selectedGroupIds = selectedGroups.map(g => g.complementGroupId);
  const availableForSelection = availableGroups.filter(g => !selectedGroupIds.includes(g.id));

  const handleAddGroup = () => {
    if (!selectedGroupId) return;
    
    onAddGroup(parseInt(selectedGroupId), isRequired);
    setSelectedGroupId("");
    setIsRequired(false);
  };

  const handleOpenCustomize = async (groupId: number) => {
    if (!productId) {
      toast.error("Você precisa salvar o produto antes de personalizar os complementos");
      return;
    }

    setCurrentGroupId(groupId);
    setLoading(true);

    try {
      // First initialize the product-specific complements if needed
      await supabase.rpc('initialize_product_specific_complements', { 
        product_id_param: productId,
        group_id_param: groupId,
        user_id_param: user?.id
      });

      // Then fetch the current customizations
      const { data, error } = await supabase.rpc('get_product_specific_complements', {
        product_id_param: productId,
        group_id_param: groupId
      });

      if (error) throw error;

      // Transform the data to match our interface
      const formattedData: ProductSpecificComplement[] = data.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        complementGroupId: item.complement_group_id,
        complementId: item.complement_id,
        isActive: item.is_active,
        customPrice: item.custom_price,
        complementName: item.complement_name,
        complementDefaultPrice: item.complement_default_price
      }));

      setSpecificComplements(formattedData);
      setIsCustomizeDialogOpen(true);
    } catch (error) {
      console.error("Error loading product-specific complements:", error);
      toast.error("Erro ao carregar complementos específicos");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplement = async (id: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('product_specific_complements')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setSpecificComplements(specificComplements.map(complement => 
        complement.id === id ? { ...complement, isActive } : complement
      ));

      toast.success(`Complemento ${isActive ? 'ativado' : 'desativado'}`);
    } catch (error) {
      console.error("Error updating complement status:", error);
      toast.error("Erro ao atualizar status do complemento");
    }
  };

  const handleUpdatePrice = async (id: number, price: number | null) => {
    try {
      const { error } = await supabase
        .from('product_specific_complements')
        .update({ custom_price: price })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setSpecificComplements(specificComplements.map(complement => 
        complement.id === id ? { ...complement, customPrice: price } : complement
      ));

      toast.success("Preço atualizado");
    } catch (error) {
      console.error("Error updating complement price:", error);
      toast.error("Erro ao atualizar preço do complemento");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Grupos de Complementos para este Produto</h3>
        <p className="text-sm text-muted-foreground">
          Adicione grupos de complementos e personalize as configurações para este produto
        </p>
      </div>
      
      {/* Add new group form */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="groupSelect">Adicionar grupo de complementos</Label>
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
              >
                <SelectTrigger id="groupSelect">
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  {availableForSelection.length === 0 ? (
                    <div className="p-2 text-center text-muted-foreground text-sm">
                      Todos os grupos já foram adicionados
                    </div>
                  ) : (
                    availableForSelection.map(group => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 md:justify-end">
              <Switch
                id="isRequiredSwitch"
                checked={isRequired}
                onCheckedChange={setIsRequired}
              />
              <Label htmlFor="isRequiredSwitch">Obrigatório</Label>
            </div>
            
            <div className="md:col-span-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAddGroup}
                disabled={!selectedGroupId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Grupo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* List of selected groups */}
      {selectedGroups.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Grupos selecionados:</h4>
          
          {selectedGroups.map(selectedGroup => {
            const groupDetails = availableGroups.find(g => g.id === selectedGroup.complementGroupId);
            
            if (!groupDetails) return null;
            
            return (
              <div key={selectedGroup.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">{groupDetails.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {groupDetails.groupType === 'ingredients' && 'Ingredientes'}
                    {groupDetails.groupType === 'specifications' && 'Especificações'}
                    {groupDetails.groupType === 'cross_sell' && 'Venda cruzada'}
                    {groupDetails.groupType === 'disposables' && 'Descartáveis'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`required-${selectedGroup.id}`}
                      checked={selectedGroup.isRequired}
                      onCheckedChange={(checked) => onUpdateRequired(selectedGroup.complementGroupId, checked)}
                    />
                    <Label htmlFor={`required-${selectedGroup.id}`}>Obrigatório</Label>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCustomize(selectedGroup.complementGroupId)}
                    disabled={!productId}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Personalizar
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveGroup(selectedGroup.complementGroupId)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">Nenhum grupo de complementos adicionado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione grupos acima para adicionar a este produto
          </p>
        </div>
      )}

      {/* Dialog for customizing complement group */}
      <Dialog open={isCustomizeDialogOpen} onOpenChange={setIsCustomizeDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Personalizar Complementos para este Produto
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Carregando complementos...</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto py-2">
              <p className="text-sm text-muted-foreground">
                Personalize quais complementos estarão disponíveis e seus preços específicos para este produto.
              </p>

              {specificComplements.length === 0 ? (
                <div className="text-center py-8">
                  <p>Nenhum complemento encontrado neste grupo</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {specificComplements.map(complement => (
                    <div key={complement.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={complement.isActive}
                          onCheckedChange={(checked) => handleToggleComplement(complement.id, checked)}
                        />
                        <div>
                          <p className={`font-medium ${!complement.isActive ? 'text-gray-400' : ''}`}>
                            {complement.complementName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Preço padrão: R$ {complement.complementDefaultPrice.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="w-32">
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Personalizar"
                              className="pl-10"
                              disabled={!complement.isActive}
                              value={complement.customPrice !== null ? complement.customPrice : ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  handleUpdatePrice(complement.id, null);
                                } else if (/^\d*\.?\d*$/.test(value)) {
                                  handleUpdatePrice(complement.id, parseFloat(value));
                                }
                              }}
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdatePrice(complement.id, null)}
                          disabled={!complement.isActive || complement.customPrice === null}
                        >
                          Restaurar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsCustomizeDialogOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductComplementGroups;
