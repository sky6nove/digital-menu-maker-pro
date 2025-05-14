
import React, { useState } from "react";
import { ComplementGroup, ProductComplementGroup } from "@/types";
import { GroupItem } from "./GroupItem";

interface GroupsListProps {
  selectedGroups: ProductComplementGroup[];
  availableGroups: ComplementGroup[];
  onRemoveGroup: (groupId: number) => void;
  onUpdateRequired: (groupId: number, isRequired: boolean) => void;
}

export const GroupsList = ({ 
  selectedGroups, 
  availableGroups, 
  onRemoveGroup, 
  onUpdateRequired 
}: GroupsListProps) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Grupos selecionados:</h4>
      
      {selectedGroups.map(selectedGroup => {
        const groupDetails = availableGroups.find(g => g.id === selectedGroup.complementGroupId);
        
        if (!groupDetails) return null;
        
        return (
          <GroupItem
            key={selectedGroup.id}
            selectedGroup={selectedGroup}
            groupDetails={groupDetails}
            onRemoveGroup={onRemoveGroup}
            onUpdateRequired={onUpdateRequired}
          />
        );
      })}
    </div>
  );
};
