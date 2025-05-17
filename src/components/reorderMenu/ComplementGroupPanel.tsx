
import React from "react";
import ReorderPanel from "./ReorderPanel";
import ItemList from "./ItemList";
import { ComplementGroup } from "@/types";

interface ComplementGroupPanelProps {
  complementGroups: ComplementGroup[];
  activeGroup: number | null;
  handleGroupSelect: (id: number) => void;
}

const ComplementGroupPanel: React.FC<ComplementGroupPanelProps> = ({
  complementGroups,
  activeGroup,
  handleGroupSelect
}) => {
  return (
    <ReorderPanel 
      title="Grupos de complementos" 
      selectedId={activeGroup}
    >
      <ItemList
        items={complementGroups}
        onMoveUp={(id) => {/* To be implemented */}}
        onMoveDown={(id) => {/* To be implemented */}}
        onClick={handleGroupSelect}
        selectedId={activeGroup}
      />
    </ReorderPanel>
  );
};

export default ComplementGroupPanel;
