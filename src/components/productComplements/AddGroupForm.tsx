
import React, { useState, useEffect } from "react";
import { ComplementGroup } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface AddGroupFormProps {
  availableGroups: ComplementGroup[];
  selectedGroupIds: number[];
  onAddGroup: (groupId: number, isRequired: boolean) => void;
}

export const AddGroupForm = ({ 
  availableGroups, 
  selectedGroupIds, 
  onAddGroup 
}: AddGroupFormProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [isRequired, setIsRequired] = useState(false);

  // Filter groups that are not already selected
  const availableForSelection = availableGroups.filter(g => !selectedGroupIds.includes(g.id));

  // When a group is selected, set the isRequired state based on the group's default
  useEffect(() => {
    if (selectedGroupId) {
      const selectedGroup = availableGroups.find(g => g.id.toString() === selectedGroupId);
      if (selectedGroup) {
        setIsRequired(selectedGroup.isRequired || false);
      }
    }
  }, [selectedGroupId, availableGroups]);

  const handleAddGroup = () => {
    if (!selectedGroupId) return;
    
    onAddGroup(parseInt(selectedGroupId), isRequired);
    setSelectedGroupId("");
    setIsRequired(false);
  };

  return (
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
  );
};
