
import React, { useState, useEffect } from "react";
import { ComplementGroup, ProductComplementGroup } from "@/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { GroupHeader } from "./GroupHeader";
import { MinMaxEditor } from "./MinMaxEditor";
import { ComplementsTable } from "./ComplementsTable";
import { useComplementItems } from "@/hooks/productComplements/useComplementItems";

interface GroupItemProps {
  selectedGroup: ProductComplementGroup;
  groupDetails: ComplementGroup;
  onRemoveGroup: (groupId: number) => void;
  onUpdateRequired: (groupId: number, isRequired: boolean) => void;
  onUpdateMinMax: (groupId: number, min: number, max: number) => void;
  onToggleGroupActive: (groupId: number, isActive: boolean) => void;
  onToggleComplementActive: (complementId: number, isActive: boolean) => void;
  onUpdatePrice: (complementId: number, price: number) => void;
}

export const GroupItem = ({
  selectedGroup,
  groupDetails,
  onRemoveGroup,
  onUpdateRequired,
  onUpdateMinMax,
  onToggleGroupActive,
  onToggleComplementActive,
  onUpdatePrice
}: GroupItemProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [minQuantity, setMinQuantity] = useState(groupDetails.minimumQuantity || 0);
  const [maxQuantity, setMaxQuantity] = useState(groupDetails.maximumQuantity || 0);
  
  const {
    complementItems,
    loading,
    loadComplementsForGroup,
    updateLocalComplementStatus
  } = useComplementItems(groupDetails.id);
  
  const isInheritedRequired = selectedGroup.isRequired === groupDetails.isRequired;

  const toggleGroup = async () => {
    if (!isOpen && complementItems.length === 0) {
      await loadComplementsForGroup();
    }
    setIsOpen(!isOpen);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleToggleComplementActive = async (complementId: number, currentActive: boolean) => {
    try {
      // Update local state first for immediate feedback
      updateLocalComplementStatus(complementId, !currentActive);
      
      // Call the provided callback
      onToggleComplementActive(complementId, !currentActive);
      
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar estado do complemento",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error toggling complement active state:", error);
    }
  };

  const saveMinMax = () => {
    // Validate values
    const min = parseInt(minQuantity.toString());
    const max = parseInt(maxQuantity.toString());
    
    if (isNaN(min) || min < 0) {
      toast({
        title: "Valor inválido",
        description: "Quantidade mínima deve ser um número maior ou igual a 0",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(max) || max < 0) {
      toast({
        title: "Valor inválido",
        description: "Quantidade máxima deve ser um número maior ou igual a 0",
        variant: "destructive",
      });
      return;
    }
    
    if (max > 0 && min > max) {
      toast({
        title: "Valores inválidos",
        description: "Quantidade mínima não pode ser maior que a máxima",
        variant: "destructive",
      });
      return;
    }
    
    // Call the update function
    onUpdateMinMax(groupDetails.id, min, max);
    setIsEditing(false);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={toggleGroup}
      className="border rounded-md overflow-hidden"
    >
      <CollapsibleTrigger asChild>
        <div onClick={(e) => e.preventDefault()}>
          <GroupHeader
            isOpen={isOpen}
            selectedGroup={selectedGroup}
            groupDetails={groupDetails}
            isEditing={isEditing}
            minQuantity={minQuantity}
            maxQuantity={maxQuantity}
            isInheritedRequired={isInheritedRequired}
            onToggleOpen={toggleGroup}
            onStartEditing={handleStartEditing}
            onRemoveGroup={onRemoveGroup}
            onToggleGroupActive={onToggleGroupActive}
            onUpdateRequired={onUpdateRequired}
          />
          
          {isEditing && (
            <MinMaxEditor
              minQuantity={minQuantity}
              maxQuantity={maxQuantity}
              onMinChange={setMinQuantity}
              onMaxChange={setMaxQuantity}
              onSave={saveMinMax}
            />
          )}
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="border-t">
          <ComplementsTable 
            complementItems={complementItems} 
            isLoading={loading}
            onToggleActive={handleToggleComplementActive}
            onUpdatePrice={onUpdatePrice}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
