
import { useState } from "react";
import { ComplementGroup } from "@/types";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Edit, Trash } from "lucide-react";

interface GroupCardProps {
  group: ComplementGroup;
  onEdit: (group: ComplementGroup) => void;
  onDelete: (id: number) => void;
  onViewComplements: (id: number) => void;
}

const GroupCard = ({ group, onEdit, onDelete, onViewComplements }: GroupCardProps) => {
  return (
    <Card key={group.id} className={`${!group.isActive ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{group.name}</CardTitle>
            <CardDescription>
              Tipo: {group.groupType === 'ingredients' ? 'Ingredientes' : 
                    group.groupType === 'specifications' ? 'Especificações' :
                    group.groupType === 'cross_sell' ? 'Venda cruzada' : 'Descartáveis'}
            </CardDescription>
            {(group.minimumQuantity > 0 || group.maximumQuantity > 0 || group.isRequired) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {group.isRequired && (
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 border-red-200">
                    Obrigatório
                  </span>
                )}
                {group.minimumQuantity > 0 && (
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200">
                    Min: {group.minimumQuantity}
                  </span>
                )}
                {group.maximumQuantity > 0 && (
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-green-200">
                    Max: {group.maximumQuantity}
                  </span>
                )}
              </div>
            )}
          </div>
          {group.imageUrl && (
            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
              <img 
                src={group.imageUrl} 
                alt={group.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {!group.imageUrl && (
            <div className="w-12 h-12 rounded-md flex items-center justify-center bg-gray-100">
              <Image className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewComplements(group.id)}
          >
            Ver Complementos
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(group)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(group.id)}
            >
              <Trash className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
