
import React from "react";
import ReorderPanel from "./ReorderPanel";
import ItemList from "./ItemList";

interface ComplementGroupPanelProps {
  complementGroups: any[];
  activeProduct: number | null;
  activeGroup: number | null;
  productName?: string;
  saving?: boolean;
  handleGroupSelect: (id: number) => void;
  handleGroupMove: (id: number, direction: 'up' | 'down') => Promise<boolean | void>;
}

const ComplementGroupPanel: React.FC<ComplementGroupPanelProps> = ({
  complementGroups,
  activeProduct,
  activeGroup,
  productName,
  saving = false,
  handleGroupSelect,
  handleGroupMove
}) => {
  // Map groups to ensure we're using the correct ID for operations
  const mappedGroups = complementGroups.map(group => ({
    ...group,
    id: group.productGroupId || group.id // Use productGroupId as the primary ID for operations
  }));

  return (
    <ReorderPanel 
      title={`Grupos de complementos${productName ? ` - ${productName}` : ''}`}
      emptyMessage="Selecione um item para visualizar seus grupos de complementos"
    >
      {activeProduct && (
        <ItemList
          items={mappedGroups}
          onMoveUp={(id) => handleGroupMove(id, 'up')}
          onMoveDown={(id) => handleGroupMove(id, 'down')}
          onClick={handleGroupSelect}
          selectedId={activeGroup}
          disabled={saving}
        />
      )}
    </ReorderPanel>
  );
};

export default ComplementGroupPanel;
