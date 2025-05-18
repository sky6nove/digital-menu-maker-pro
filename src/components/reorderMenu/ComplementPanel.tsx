
import React from "react";
import ReorderPanel from "./ReorderPanel";
import ItemList from "./ItemList";

interface Complement {
  id: number;
  name: string;
  groupId: number;
  groupName?: string;
  isActive?: boolean;
  price?: number;
}

interface ComplementPanelProps {
  complements: Complement[];
  activeGroup: number | null;
  groupName?: string;
  handleComplementMove: (id: number, direction: 'up' | 'down') => void;
}

const ComplementPanel: React.FC<ComplementPanelProps> = ({
  complements,
  activeGroup,
  groupName,
  handleComplementMove
}) => {
  return (
    <ReorderPanel 
      title={`Complementos${groupName ? ` - ${groupName}` : ''}`}
      emptyMessage="Selecione um grupo para visualizar seus complementos"
    >
      {activeGroup && complements && complements.length > 0 ? (
        <ItemList
          items={complements}
          onMoveUp={(id) => handleComplementMove(id, 'up')}
          onMoveDown={(id) => handleComplementMove(id, 'down')}
        />
      ) : activeGroup ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Nenhum complemento encontrado neste grupo
        </div>
      ) : null}
    </ReorderPanel>
  );
};

export default ComplementPanel;
