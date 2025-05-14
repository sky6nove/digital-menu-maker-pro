
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
}

const ProductComplementGroups = ({
  availableGroups,
  selectedGroups,
  onAddGroup,
  onRemoveGroup,
  onUpdateRequired
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
        />
      ) : (
        <EmptyGroupsState />
      )}
    </div>
  );
};

export default ProductComplementGroups;
