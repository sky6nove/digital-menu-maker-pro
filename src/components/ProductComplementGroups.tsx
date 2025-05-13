
import React, { useState, useEffect } from "react";
import { ComplementGroup, ProductComplementGroup } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductComplementGroupsProps {
  availableGroups: ComplementGroup[];
  selectedGroups: ProductComplementGroup[];
  onAddGroup: (groupId: number, isRequired: boolean) => void;
  onRemoveGroup: (groupId: number) => void;
  onUpdateRequired: (groupId: number, isRequired: boolean) => void;
}

const ProductComplementGroups = ({
  availableGroups,
  selectedGroups,
  onAddGroup,
  onRemoveGroup,
  onUpdateRequired
}: ProductComplementGroupsProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [isRequired, setIsRequired] = useState(false);
  
  // When a group is selected, set the isRequired state based on the group's default
  useEffect(() => {
    if (selectedGroupId) {
      const selectedGroup = availableGroups.find(g => g.id.toString() === selectedGroupId);
      if (selectedGroup) {
        setIsRequired(selectedGroup.isRequired || false);
      }
    }
  }, [selectedGroupId, availableGroups]);

  const selectedGroupIds = selectedGroups.map(g => g.complementGroupId);
  const availableForSelection = availableGroups.filter(g => !selectedGroupIds.includes(g.id));

  const handleAddGroup = () => {
    if (!selectedGroupId) return;
    
    onAddGroup(parseInt(selectedGroupId), isRequired);
    setSelectedGroupId("");
    setIsRequired(false);
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
                        {group.name} {group.isRequired && " (Obrigatório por padrão)"}
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
            
            const isInheritedRequired = selectedGroup.isRequired === groupDetails.isRequired;
            
            return (
              <div key={selectedGroup.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">{groupDetails.name}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-muted-foreground">
                      {groupDetails.groupType === 'ingredients' && 'Ingredientes'}
                      {groupDetails.groupType === 'specifications' && 'Especificações'}
                      {groupDetails.groupType === 'cross_sell' && 'Venda cruzada'}
                      {groupDetails.groupType === 'disposables' && 'Descartáveis'}
                    </p>
                    
                    {groupDetails.minimumQuantity > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        • Min: {groupDetails.minimumQuantity}
                      </span>
                    )}
                    
                    {groupDetails.maximumQuantity > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        • Max: {groupDetails.maximumQuantity}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`required-${selectedGroup.id}`}
                      checked={selectedGroup.isRequired}
                      onCheckedChange={(checked) => onUpdateRequired(selectedGroup.complementGroupId, checked)}
                    />
                    <Label htmlFor={`required-${selectedGroup.id}`} className="flex items-center">
                      Obrigatório
                      {!isInheritedRequired && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                Esta configuração é diferente da configuração padrão do grupo
                                ({groupDetails.isRequired ? 'obrigatório' : 'opcional'})
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </Label>
                  </div>
                  
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
    </div>
  );
};

export default ProductComplementGroups;
