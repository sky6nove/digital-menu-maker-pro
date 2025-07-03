
import { useEffect } from "react";
import { useProductComplementGroups } from "@/hooks/productComplements/useProductComplementGroups";
import ProductComplementGroups from "@/components/ProductComplementGroups";

interface ComplementGroupsTabProps {
  productId?: number;
  onChange: (selectedGroups: number[]) => void;
}

const ComplementGroupsTab = ({
  productId,
  onChange
}: ComplementGroupsTabProps) => {
  const {
    availableGroups,
    selectedGroups,
    addGroupToProduct,
    removeGroupFromProduct,
    updateGroupRequiredStatus,
    updateGroupMinMax,
    toggleGroupActive,
    toggleComplementActive,
    updateComplementPrice
  } = useProductComplementGroups(productId);

  // Update parent component when selected groups change
  useEffect(() => {
    const groupIds = selectedGroups.map(group => group.complementGroupId);
    onChange(groupIds);
  }, [selectedGroups, onChange]);

  return (
    <div className="space-y-4">
      <ProductComplementGroups
        availableGroups={availableGroups}
        selectedGroups={selectedGroups}
        onAddGroup={addGroupToProduct}
        onRemoveGroup={removeGroupFromProduct}
        onUpdateRequired={updateGroupRequiredStatus}
        onUpdateMinMax={updateGroupMinMax}
        onToggleGroupActive={toggleGroupActive}
        onToggleComplementActive={toggleComplementActive}
        onUpdatePrice={updateComplementPrice}
      />
    </div>
  );
};

export default ComplementGroupsTab;
