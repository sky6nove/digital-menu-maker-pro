
import React from "react";
import { ComplementGroup, ProductComplementGroup } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Edit, Info, Trash } from "lucide-react";

interface GroupHeaderProps {
  isOpen: boolean;
  selectedGroup: ProductComplementGroup;
  groupDetails: ComplementGroup;
  isEditing: boolean;
  minQuantity: number;
  maxQuantity: number;
  isInheritedRequired: boolean;
  onToggleOpen: () => void;
  onStartEditing: () => void;
  onRemoveGroup: (groupId: number) => void;
  onToggleGroupActive: (groupId: number, isActive: boolean) => void;
  onUpdateRequired: (groupId: number, isRequired: boolean) => void;
}

export const GroupHeader = ({
  isOpen,
  selectedGroup,
  groupDetails,
  isEditing,
  minQuantity,
  maxQuantity,
  isInheritedRequired,
  onToggleOpen,
  onStartEditing,
  onRemoveGroup,
  onToggleGroupActive,
  onUpdateRequired
}: GroupHeaderProps) => {
  return (
    <div className="p-4 flex items-center justify-between bg-white hover:bg-gray-50 cursor-pointer">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={onToggleOpen}>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{groupDetails.name}</p>
              <Badge variant={groupDetails.isActive ? "default" : "secondary"}>
                {groupDetails.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <p className="text-sm text-muted-foreground">
                {groupDetails.groupType === 'ingredients' && 'Ingredientes'}
                {groupDetails.groupType === 'specifications' && 'Especificações'}
                {groupDetails.groupType === 'cross_sell' && 'Venda cruzada'}
                {groupDetails.groupType === 'disposables' && 'Descartáveis'}
              </p>
              
              {!isEditing && (
                <>
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
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 ml-1" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEditing();
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`active-${selectedGroup.id}`}
            checked={groupDetails.isActive}
            onCheckedChange={(checked) => {
              onToggleGroupActive(groupDetails.id, checked);
            }}
          />
          <Label htmlFor={`active-${selectedGroup.id}`}>
            Ativo
          </Label>
        </div>
        
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
          onClick={(e) => {
            e.stopPropagation();
            onRemoveGroup(selectedGroup.complementGroupId);
          }}
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};
