
import React, { useState } from "react";
import { ComplementGroup, ProductComplementGroup, ComplementItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Trash, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GroupItemProps {
  selectedGroup: ProductComplementGroup;
  groupDetails: ComplementGroup;
  onRemoveGroup: (groupId: number) => void;
  onUpdateRequired: (groupId: number, isRequired: boolean) => void;
}

export const GroupItem = ({
  selectedGroup,
  groupDetails,
  onRemoveGroup,
  onUpdateRequired
}: GroupItemProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [complementItems, setComplementItems] = useState<ComplementItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  const isInheritedRequired = selectedGroup.isRequired === groupDetails.isRequired;

  const toggleGroup = async () => {
    if (!isOpen && complementItems.length === 0) {
      await loadComplementsForGroup();
    }
    setIsOpen(!isOpen);
  };

  const loadComplementsForGroup = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("complement_items")
        .select("*")
        .eq("group_id", groupDetails.id);
        
      if (error) throw error;
      
      // Transform to match our interface
      const formattedItems: ComplementItem[] = data.map(item => ({
        id: item.id,
        groupId: item.group_id,
        name: item.name,
        price: item.price || 0,
        isActive: item.is_active,
        productId: item.product_id || undefined
      }));
      
      setComplementItems(formattedItems);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar complementos",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error loading complements:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={toggleGroup}
      className="border rounded-md overflow-hidden"
    >
      <div className="p-4 flex items-center justify-between bg-white hover:bg-gray-50 cursor-pointer">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <div>
              <p className="font-medium">{groupDetails.name}</p>
              <div className="flex items-center gap-1">
                <p className="text-sm text-muted-foreground">
                  {groupDetails.groupType === 'ingredients' && 'Ingredientes'}
                  {groupDetails.groupType === 'specifications' && 'Especificações'}
                  {groupDetails.groupType === 'cross_sell' && 'Venda cruzada'}
                  {groupDetails.groupType === 'disposables' && 'Descartáveis'}
                </p>
                
                {groupDetails.minimumQuantity > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    • Min: {groupDetails.minimumQuantity}
                  </span>
                )}
                
                {groupDetails.maximumQuantity > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    • Max: {groupDetails.maximumQuantity}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id={`required-${selectedGroup.id}`}
              checked={selectedGroup.isRequired}
              onCheckedChange={(checked) => onUpdateRequired(selectedGroup.complementGroupId, checked)}
            />
            <Label htmlFor={`required-${selectedGroup.id}`} className="flex items-center">
              Obrigatório
              {!isInheritedRequired && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Esta configuração é diferente da configuração padrão do grupo
                        ({groupDetails.isRequired ? 'obrigatório' : 'opcional'})
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Label>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveGroup(selectedGroup.complementGroupId)}
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      
      <CollapsibleContent>
        <ComplementsTable 
          complementItems={complementItems} 
          isLoading={loading} 
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

interface ComplementsTableProps {
  complementItems: ComplementItem[];
  isLoading: boolean;
}

const ComplementsTable = ({ complementItems, isLoading }: ComplementsTableProps) => {
  return (
    <div className="border-t">
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando complementos...</p>
        </div>
      ) : complementItems.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complementItems.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>R$ {item.price.toFixed(2).replace('.', ',')}</TableCell>
                <TableCell>
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
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
      )}
    </div>
  );
};
