
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
      ) : activeGroup && safeComplements.length > 0 ? (
        <ItemList
          items={safeComplements}
          onMoveUp={(id) => {
            console.log("Moving complement up:", id);
            handleComplementMove(id, 'up');
          }}
          onMoveDown={(id) => {
            console.log("Moving complement down:", id);
            handleComplementMove(id, 'down');
          }}
        />
      ) : activeGroup ? (
        <div className="p-4 text-center text-muted-foreground">
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
