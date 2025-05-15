
import ProductComplementGroups from "@/components/ProductComplementGroups";
import { useProductComplementGroups } from "@/hooks/productComplements";

interface ComplementGroupsTabProps {
  productId?: number;
}

const ComplementGroupsTab = ({ productId }: ComplementGroupsTabProps) => {
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

  return (
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
  );
};

export default ComplementGroupsTab;
