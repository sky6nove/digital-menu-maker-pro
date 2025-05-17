
import React from "react";
import ReorderPanel from "./ReorderPanel";
import ItemList from "./ItemList";

interface Complement {
  id: number;
  name: string;
  groupId: number;
  groupName: string;
}

interface ComplementPanelProps {
  complements: Complement[];
  activeGroup: number | null;
  groupName?: string;
}

const ComplementPanel: React.FC<ComplementPanelProps> = ({
  complements,
  activeGroup,
  groupName
}) => {
  return (
    <ReorderPanel 
      title={`Complementos${groupName ? ` - ${groupName}` : ''}`}
      emptyMessage="Selecione um grupo para visualizar seus complementos"
    >
      {activeGroup && (
        <ItemList
          items={complements}
          onMoveUp={(id) => {/* To be implemented */}}
          onMoveDown={(id) => {/* To be implemented */}}
        />
      )}
    </ReorderPanel>
  );
};

export default ComplementPanel;
