
import React, { useState } from "react";
import { ComplementGroup, ProductComplementGroup, ComplementItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Trash, Info, ChevronDown, ChevronUp, Edit, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GroupItemProps {
  selectedGroup: ProductComplementGroup;
  groupDetails: ComplementGroup;
  onRemoveGroup: (groupId: number) => void;
  onUpdateRequired: (groupId: number, isRequired: boolean) => void;
  onUpdateMinMax: (groupId: number, min: number, max: number) => void;
  onToggleGroupActive: (groupId: number, isActive: boolean) => void;
  onToggleComplementActive: (complementId: number, isActive: boolean) => void;
}

export const GroupItem = ({
  selectedGroup,
  groupDetails,
  onRemoveGroup,
  onUpdateRequired,
  onUpdateMinMax,
  onToggleGroupActive,
  onToggleComplementActive
}: GroupItemProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [complementItems, setComplementItems] = useState<ComplementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [minQuantity, setMinQuantity] = useState(groupDetails.minimumQuantity || 0);
  const [maxQuantity, setMaxQuantity] = useState(groupDetails.maximumQuantity || 0);
  
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

  const handleToggleComplementActive = async (complementId: number, currentActive: boolean) => {
    try {
      // Update local state first for immediate feedback
      setComplementItems(items => 
        items.map(item => 
          item.id === complementId 
            ? { ...item, isActive: !currentActive } 
            : item
        )
      );
      
      // Call the provided callback
      onToggleComplementActive(complementId, !currentActive);
      
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar estado do complemento",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error toggling complement active state:", error);
    }
  };

  const saveMinMax = () => {
    // Validate values
    const min = parseInt(minQuantity.toString());
    const max = parseInt(maxQuantity.toString());
    
    if (isNaN(min) || min < 0) {
      toast({
        title: "Valor inválido",
        description: "Quantidade mínima deve ser um número maior ou igual a 0",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(max) || max < 0) {
      toast({
        title: "Valor inválido",
        description: "Quantidade máxima deve ser um número maior ou igual a 0",
        variant: "destructive",
      });
      return;
    }
    
    if (max > 0 && min > max) {
      toast({
        title: "Valores inválidos",
        description: "Quantidade mínima não pode ser maior que a máxima",
        variant: "destructive",
      });
      return;
    }
    
    // Call the update function
    onUpdateMinMax(groupDetails.id, min, max);
    setIsEditing(false);
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
              <div className="flex items-center gap-2">
                <p className="font-medium">{groupDetails.name}</p>
                <Badge variant={groupDetails.isActive ? "default" : "secondary"}>
                  {groupDetails.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-sm text-muted-foreground">
                  {groupDetails.groupType === 'ingredients' && 'Ingredientes'}
                  {groupDetails.groupType === 'specifications' && 'Especificações'}
                  {groupDetails.groupType === 'cross_sell' && 'Venda cruzada'}
                  {groupDetails.groupType === 'disposables' && 'Descartáveis'}
                </p>
                
                {!isEditing ? (
                  <>
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
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-1" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 ml-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center">
                      <span className="text-xs mr-1">Min:</span>
                      <Input
                        type="number"
                        min="0"
                        className="h-6 w-12 text-xs"
                        value={minQuantity}
                        onChange={(e) => setMinQuantity(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs mr-1">Max:</span>
                      <Input
                        type="number"
                        min="0"
                        className="h-6 w-12 text-xs"
                        value={maxQuantity}
                        onChange={(e) => setMaxQuantity(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={(e) => {
                        e.stopPropagation();
                        saveMinMax();
                      }}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id={`active-${selectedGroup.id}`}
              checked={groupDetails.isActive}
              onCheckedChange={(checked) => {
                onToggleGroupActive(groupDetails.id, checked);
              }}
            />
            <Label htmlFor={`active-${selectedGroup.id}`}>
              Ativo
            </Label>
          </div>
          
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
            onClick={(e) => {
              e.stopPropagation();
              onRemoveGroup(selectedGroup.complementGroupId);
            }}
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      
      <CollapsibleContent>
        <ComplementsTable 
          complementItems={complementItems} 
          isLoading={loading}
          onToggleActive={handleToggleComplementActive}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

interface ComplementsTableProps {
  complementItems: ComplementItem[];
  isLoading: boolean;
  onToggleActive: (complementId: number, currentActive: boolean) => void;
}

const ComplementsTable = ({ complementItems, isLoading, onToggleActive }: ComplementsTableProps) => {
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
              <TableHead className="text-right">Ações</TableHead>
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
