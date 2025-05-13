
import React from "react";
import { ComplementGroup, ProductComplementGroup } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";

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
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("");
  const [isRequired, setIsRequired] = React.useState(false);
  
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
