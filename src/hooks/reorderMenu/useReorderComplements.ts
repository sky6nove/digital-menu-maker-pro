
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useReorderLogic } from "./useReorderLogic";

export const useReorderComplements = (
  activeGroup: number | null,
  fetchComplementsByGroup: (groupId: number) => Promise<any[]>
) => {
  const [groupComplements, setGroupComplements] = useState<any[]>([]);
  const [loadingComplements, setLoadingComplements] = useState(false);
  const [saving, setSaving] = useState(false);
  const { reorderComplements } = useReorderLogic();

  useEffect(() => {
    const loadGroupComplements = async () => {
      if (activeGroup) {
        setLoadingComplements(true);
        try {
          const complements = await fetchComplementsByGroup(activeGroup);
          
          const sortedComplements = [...complements].sort((a, b) => {
            const orderA = a.order ?? 999999;
            const orderB = b.order ?? 999999;
            if (orderA !== orderB) return orderA - orderB;
            return a.name.localeCompare(b.name);
          });
          
          setGroupComplements(sortedComplements || []);
        } catch (error) {
          console.error("Error loading complements:", error);
          toast.error("Erro ao carregar complementos");
          setGroupComplements([]);
        } finally {
          setLoadingComplements(false);
        }
      } else {
        setGroupComplements([]);
        setLoadingComplements(false);
      }
    };

    loadGroupComplements();
  }, [activeGroup, fetchComplementsByGroup]);

  const handleComplementMove = async (id: number, direction: 'up' | 'down') => {
    if (saving || !activeGroup) return;

    setSaving(true);
    
    const complement = groupComplements.find(c => c.id === id);
    const isSpecificComplement = complement && 'specificId' in complement && complement.specificId;
    const actualId = isSpecificComplement ? complement.specificId : id;
    
    const formattedComplements = groupComplements.map(comp => ({
      id: isSpecificComplement ? comp.specificId || comp.id : comp.id,
      name: comp.name,
      order: comp.order || 0,
      isActive: comp.isActive
    }));

    const success = await reorderComplements(
      formattedComplements,
      actualId,
      direction,
      !!isSpecificComplement,
      async () => {
        const updatedComplementsData = await fetchComplementsByGroup(activeGroup);
        const sortedUpdatedComplements = [...updatedComplementsData].sort((a, b) => {
          const orderA = a.order ?? 999999;
          const orderB = b.order ?? 999999;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        });
        setGroupComplements(sortedUpdatedComplements || []);
      }
    );
    
    setSaving(false);
    return success;
  };

  return {
    groupComplements,
    loadingComplements,
    saving,
    handleComplementMove
  };
};
