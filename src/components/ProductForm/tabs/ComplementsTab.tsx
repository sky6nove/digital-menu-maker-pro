
import { useEffect } from "react";
import { Complement } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ComplementsTabProps {
  selectedComplements: number[];
  onChange: (selectedComplements: number[]) => void;
  availableComplements?: Complement[];
  loadComplements?: () => Promise<any>;
}

const ComplementsTab = ({
  selectedComplements = [],
  onChange,
  availableComplements = [],
  loadComplements
}: ComplementsTabProps) => {
  useEffect(() => {
    if (loadComplements) {
      loadComplements();
    }
  }, [loadComplements]);

  const toggleComplement = (complementId: number) => {
    if (selectedComplements.includes(complementId)) {
      onChange(selectedComplements.filter(id => id !== complementId));
    } else {
      onChange([...selectedComplements, complementId]);
    }
  };

  return (
    <div className="space-y-4">
      {availableComplements.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Nenhum complemento disponível</p>
          <p className="text-sm mt-2">
            Adicione complementos primeiro no menu de Complementos
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Complementos disponíveis para este produto</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableComplements.map(complement => (
              <div 
                key={complement.id} 
                className={`p-3 rounded-md border flex items-center space-x-2 cursor-pointer ${
                  selectedComplements.includes(complement.id) 
                    ? 'border-primary bg-primary bg-opacity-10' 
                    : 'border-gray-200'
                }`}
                onClick={() => toggleComplement(complement.id)}
              >
                <div className="flex-1">
                  <p className="font-medium">{complement.name}</p>
                  <p className="text-sm text-gray-500">
                    R$ {complement.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <Switch 
                  checked={selectedComplements.includes(complement.id)}
                  onCheckedChange={() => toggleComplement(complement.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplementsTab;
