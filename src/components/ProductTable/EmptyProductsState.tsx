import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyProductsStateProps {
  onAddProduct: () => void;
}

const EmptyProductsState = ({ onAddProduct }: EmptyProductsStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">Nenhum produto cadastrado ainda.</p>
      <Button onClick={onAddProduct}>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar primeiro produto
      </Button>
    </div>
  );
};

export default EmptyProductsState;