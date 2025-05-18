
import React from "react";
import { toast } from "sonner";
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
  loading?: boolean;
}

const ComplementPanel: React.FC<ComplementPanelProps> = ({
  complements,
  activeGroup,
  groupName,
  handleComplementMove,
  loading = false
}) => {
  return (
    <ReorderPanel 
      title={`Complementos${groupName ? ` - ${groupName}` : ''}`}
      emptyMessage="Selecione um grupo para visualizar seus complementos"
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2">Carregando complementos...</span>
        </div>
      ) : activeGroup && complements && complements.length > 0 ? (
        <ItemList
          items={complements}
          onMoveUp={(id) => handleComplementMove(id, 'up')}
          onMoveDown={(id) => handleComplementMove(id, 'down')}
        />
      ) : activeGroup ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Nenhum complemento encontrado neste grupo.
          <button 
            className="ml-1 text-primary underline hover:text-primary/80"
            onClick={() => toast.info("Você pode adicionar complementos ao grupo na seção de Grupos de Complementos")}
          >
            Saiba mais
          </button>
        </div>
      ) : null}
    </ReorderPanel>
  );
};

export default ComplementPanel;
