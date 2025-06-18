
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
  // Map groups for reordering operations (use productGroupId)
  const mappedGroupsForReorder = complementGroups.map(group => ({
    ...group,
    id: group.productGroupId || group.id // Use productGroupId as the primary ID for reorder operations
  }));

  // Handle click to select group - pass the productGroupId for internal handling
  const handleGroupClick = (id: number) => {
    handleGroupSelect(id);
  };

  return (
    <ReorderPanel 
      title={`Grupos de complementos${productName ? ` - ${productName}` : ''}`}
      emptyMessage="Selecione um item para visualizar seus grupos de complementos"
    >
      {activeProduct && (
        <ItemList
          items={mappedGroupsForReorder}
          onMoveUp={(id) => handleGroupMove(id, 'up')}
          onMoveDown={(id) => handleGroupMove(id, 'down')}
          onClick={handleGroupClick}
          selectedId={activeGroup}
          disabled={saving}
        />
      )}
    </ReorderPanel>
  );
};

export default ComplementGroupPanel;
