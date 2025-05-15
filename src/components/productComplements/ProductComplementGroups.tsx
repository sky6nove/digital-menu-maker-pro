
import React, { useState } from "react";
import { ComplementGroup, ProductComplementGroup } from "@/types";
import { AddGroupForm } from "./AddGroupForm";
import { GroupsList } from "./GroupsList";
import { EmptyGroupsState } from "./EmptyGroupsState";

interface ProductComplementGroupsProps {
  availableGroups: ComplementGroup[];
  selectedGroups: ProductComplementGroup[];
  onAddGroup: (groupId: number, isRequired: boolean) => void;
  onRemoveGroup: (groupId: number) => void;
  onUpdateRequired: (groupId: number, isRequired: boolean) => void;
  onUpdateMinMax: (groupId: number, min: number, max: number) => void;
  onToggleGroupActive: (groupId: number, isActive: boolean) => void;
  onToggleComplementActive: (complementId: number, isActive: boolean) => void;
}

const ProductComplementGroups = ({
  availableGroups,
  selectedGroups,
  onAddGroup,
  onRemoveGroup,
  onUpdateRequired,
  onUpdateMinMax,
  onToggleGroupActive,
  onToggleComplementActive
}: ProductComplementGroupsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Grupos de Complementos para este Produto</h3>
        <p className="text-sm text-muted-foreground">
          Adicione grupos de complementos e personalize as configurações para este produto
        </p>
      </div>
      
      {/* Add new group form */}
      <AddGroupForm 
        availableGroups={availableGroups} 
        selectedGroupIds={selectedGroups.map(g => g.complementGroupId)}
        onAddGroup={onAddGroup}
      />
      
      {/* List of selected groups */}
      {selectedGroups.length > 0 ? (
        <GroupsList 
          selectedGroups={selectedGroups} 
          availableGroups={availableGroups} 
          onRemoveGroup={onRemoveGroup}
          onUpdateRequired={onUpdateRequired}
          onUpdateMinMax={onUpdateMinMax}
          onToggleGroupActive={onToggleGroupActive}
          onToggleComplementActive={onToggleComplementActive}
        />
      ) : (
        <EmptyGroupsState />
      )}
    </div>
  );
};

export default ProductComplementGroups;
