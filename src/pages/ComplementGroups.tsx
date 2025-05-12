
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AuthNavbar from "@/components/AuthNavbar";
import { Plus } from "lucide-react";
import { ComplementGroup } from "@/types";
import ComplementGroupForm from "@/components/ComplementGroupForm";
import ComplementsList from "@/components/ComplementsList";
import GroupCard from "@/components/complementGroups/GroupCard";
import EmptyState from "@/components/complementGroups/EmptyState";
import LoadingState from "@/components/complementGroups/LoadingState";
import { useComplementGroups } from "@/hooks/useComplementGroups";

const ComplementGroups = () => {
  const { loading, complementGroups, handleDeleteGroup, handleSubmitGroup } = useComplementGroups();
  const [currentGroup, setCurrentGroup] = useState<ComplementGroup | undefined>(undefined);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleAddGroup = () => {
    setCurrentGroup(undefined);
    setIsGroupFormOpen(true);
  };

  const handleEditGroup = (group: ComplementGroup) => {
    setCurrentGroup(group);
    setIsGroupFormOpen(true);
  };

  const handleViewComplements = (groupId: number) => {
    setSelectedGroupId(groupId);
  };

  const handleSubmitGroupForm = async (groupData: Omit<ComplementGroup, "id"> | ComplementGroup) => {
    const success = await handleSubmitGroup(groupData);
    if (success) {
      setIsGroupFormOpen(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthNavbar />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Grupos de Complementos</h1>
            <p className="text-muted-foreground">Gerencie grupos de complementos para seus produtos</p>
          </div>
          
          <Button onClick={handleAddGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Grupo
          </Button>
        </div>
        
        {selectedGroupId === null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complementGroups.map(group => (
              <GroupCard 
                key={group.id}
                group={group}
                onEdit={handleEditGroup}
                onDelete={handleDeleteGroup}
                onViewComplements={handleViewComplements}
              />
            ))}
            
            {complementGroups.length === 0 && (
              <EmptyState onAddGroup={handleAddGroup} />
            )}
          </div>
        ) : (
          <div>
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={() => setSelectedGroupId(null)}
            >
              Voltar para grupos
            </Button>
            
            <ComplementsList 
              groupId={selectedGroupId} 
              groupName={complementGroups.find(g => g.id === selectedGroupId)?.name || ""}
            />
          </div>
        )}
        
        <Dialog open={isGroupFormOpen} onOpenChange={setIsGroupFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogTitle>
              {currentGroup ? 'Editar Grupo de Complementos' : 'Adicionar Grupo de Complementos'}
            </DialogTitle>
            <ComplementGroupForm
              group={currentGroup}
              onSubmit={handleSubmitGroupForm}
              onCancel={() => setIsGroupFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ComplementGroups;
