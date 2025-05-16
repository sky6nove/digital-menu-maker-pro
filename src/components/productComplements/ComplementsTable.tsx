
import React, { useState } from "react";
import { ComplementItem } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Edit, Save } from "lucide-react";

interface ComplementsTableProps {
  complementItems: ComplementItem[];
  isLoading: boolean;
  onToggleActive: (complementId: number, currentActive: boolean) => void;
  onUpdatePrice: (complementId: number, price: number) => void;
}

export const ComplementsTable = ({ 
  complementItems, 
  isLoading, 
  onToggleActive, 
  onUpdatePrice 
}: ComplementsTableProps) => {
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [priceValue, setPriceValue] = useState<string>('');

  const handleEditPrice = (complementId: number, currentPrice: number) => {
    setEditingPriceId(complementId);
    setPriceValue(currentPrice.toString());
  };

  const handleSavePrice = (complementId: number) => {
    const newPrice = parseFloat(priceValue);
    if (isNaN(newPrice) || newPrice < 0) {
      return; // Invalid price
    }
    
    onUpdatePrice(complementId, newPrice);
    setEditingPriceId(null);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only valid price format
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setPriceValue(value);
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, complementId: number) => {
    if (e.key === 'Enter') {
      handleSavePrice(complementId);
    } else if (e.key === 'Escape') {
      setEditingPriceId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Carregando complementos...</p>
      </div>
    );
  }

  if (complementItems.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Nenhum complemento encontrado para este grupo.
        <p className="mt-1 text-sm">
          <Button 
            variant="link" 
            className="h-auto p-0"
            onClick={() => window.location.href = "/complement-groups"}
          >
            Ir para Grupos de Complementos
          </Button>
          {" "}para adicionar complementos.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {complementItems.map(item => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              {editingPriceId === item.id ? (
                <div className="flex items-center space-x-2">
                  <div className="relative w-24">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      value={priceValue}
                      onChange={handlePriceChange}
                      onKeyDown={(e) => handlePriceKeyDown(e, item.id)}
                      className="pl-8 py-1 h-8"
                      autoFocus
                    />
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleSavePrice(item.id)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <span>R$ {item.price.toFixed(2).replace('.', ',')}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 ml-2"
                    onClick={() => handleEditPrice(item.id, item.price)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Switch
                id={`comp-active-${item.id}`}
                checked={item.isActive}
                onCheckedChange={() => onToggleActive(item.id, item.isActive)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
