
import { useEffect } from "react";
import { useAvailableGroups } from "./useAvailableGroups";
import { useSelectedGroups } from "./useSelectedGroups";
import { useGroupActions } from "./useGroupActions";

export const useProductComplementGroups = (productId?: number) => {
  const { 
    availableGroups, 
    setAvailableGroups, 
    loadAvailableGroups, 
    loading: loadingAvailable 
  } = useAvailableGroups();

  const { 
    selectedGroups, 
    setSelectedGroups, 
    loadSelectedGroups 
  } = useSelectedGroups(productId);

  const groupActions = useGroupActions({
    productId,
    selectedGroups,
    availableGroups,
    setSelectedGroups,
    setAvailableGroups
  });

  const loadComplementGroups = async () => {
    await Promise.all([loadAvailableGroups(), loadSelectedGroups()]);
  };

  useEffect(() => {
    if (productId) {
      loadSelectedGroups();
    }
  }, [productId]);

  return {
    loading: loadingAvailable,
    availableGroups,
    selectedGroups,
    loadComplementGroups,
    ...groupActions
  };
};
