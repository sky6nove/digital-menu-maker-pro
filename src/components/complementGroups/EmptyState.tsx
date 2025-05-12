
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  onAddGroup: () => void;
}

const EmptyState = ({ onAddGroup }: EmptyStateProps) => {
  return (
    <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg">
      <p className="text-muted-foreground">Nenhum grupo de complemento encontrado.</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onAddGroup}
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar seu primeiro grupo
      </Button>
    </div>
  );
};

export default EmptyState;
