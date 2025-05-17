
import React from "react";
import ReorderPanel from "./ReorderPanel";
import ItemList from "./ItemList";
import { ComplementGroup } from "@/types";

interface ComplementGroupPanelProps {
  complementGroups: any[];
  activeProduct: number | null;
  activeGroup: number | null;
  productName?: string;
  handleGroupSelect: (id: number) => void;
  handleGroupMove: (id: number, direction: 'up' | 'down') => void;
}

const ComplementGroupPanel: React.FC<ComplementGroupPanelProps> = ({
  complementGroups,
  activeProduct,
  activeGroup,
  productName,
  handleGroupSelect,
  handleGroupMove
}) => {
  return (
    <ReorderPanel 
      title={`Grupos de complementos${productName ? ` - ${productName}` : ''}`}
      emptyMessage="Selecione um item para visualizar seus grupos de complementos"
    >
      {activeProduct && (
        <ItemList
          items={complementGroups}
          onMoveUp={(id) => handleGroupMove(id, 'up')}
          onMoveDown={(id) => handleGroupMove(id, 'down')}
          onClick={handleGroupSelect}
          selectedId={activeGroup}
        />
      )}
    </ReorderPanel>
  );
};

export default ComplementGroupPanel;
