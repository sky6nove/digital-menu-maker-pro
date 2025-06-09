
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
  order?: number;
}

interface ComplementPanelProps {
  complements: Complement[];
  activeGroup: number | null;
  groupName?: string;
  saving?: boolean;
  handleComplementMove: (id: number, direction: 'up' | 'down') => Promise<boolean | void>;
  loading?: boolean;
}

const ComplementPanel: React.FC<ComplementPanelProps> = ({
  complements,
  activeGroup,
  groupName,
  saving = false,
  handleComplementMove,
  loading = false
}) => {
  const safeComplements = complements || [];
  
  return (
    <ReorderPanel 
      title={`Complementos${groupName ? ` - ${groupName}` : ''}`}
      emptyMessage="Selecione um grupo para visualizar seus complementos"
    >
      {loading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando complementos...</p>
        </div>
      ) : activeGroup ? (
        <ItemList
          items={safeComplements}
          onMoveUp={(id) => handleComplementMove(id, 'up')}
          onMoveDown={(id) => handleComplementMove(id, 'down')}
          loading={loading}
          disabled={saving}
        />
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          Selecione um grupo para visualizar seus complementos
        </div>
      )}
    </ReorderPanel>
  );
};

export default ComplementPanel;
