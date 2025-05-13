
import React, { useState, useEffect } from "react";
import { ComplementGroup, ComplementItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus } from "lucide-react";

interface ProductComplementSelectorProps {
  complementGroups: {
    group: ComplementGroup;
    complements: ComplementItem[];
    isRequired: boolean;
  }[];
  onSelect: (groupId: number, selectedItems: ComplementItem[]) => void;
}

const ProductComplementSelector: React.FC<ProductComplementSelectorProps> = ({
  complementGroups,
  onSelect,
}) => {
  const [selectedComplements, setSelectedComplements] = useState<{
    [groupId: number]: ComplementItem[];
  }>({});

  useEffect(() => {
    // Initialize selected complements for required groups with minimum items
    const initialSelections: { [groupId: number]: ComplementItem[] } = {};
    complementGroups.forEach(({ group, complements, isRequired }) => {
      if (isRequired && group.minimumQuantity && group.minimumQuantity > 0) {
        // Pre-select the first N complements if the group is required
        initialSelections[group.id] = complements.slice(0, group.minimumQuantity).map(c => ({
          ...c,
          quantity: 1
        }));
      } else {
        initialSelections[group.id] = [];
      }
    });
    setSelectedComplements(initialSelections);
  }, [complementGroups]);

  const handleComplementSelect = (groupId: number, complement: ComplementItem, quantity: number = 1) => {
    setSelectedComplements(prev => {
      const group = complementGroups.find(g => g.group.id === groupId)?.group;
      const currentItems = prev[groupId] || [];
      
      // Check if the complement is already selected
      const existingIndex = currentItems.findIndex(item => item.id === complement.id);
      
      let updatedItems;

      if (existingIndex >= 0) {
        // The complement is already selected
        const newQuantity = currentItems[existingIndex].quantity! + quantity;
        
        if (newQuantity <= 0) {
          // Remove the complement if quantity becomes 0 or negative
          updatedItems = currentItems.filter(item => item.id !== complement.id);
        } else {
          // Update the quantity
          updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: newQuantity
          };
        }
      } else {
        // The complement is not selected, add it if quantity is positive
        if (quantity > 0) {
          // Check if we're exceeding the maximum quantity allowed
          const currentTotalItems = currentItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
          
          if (group?.maximumQuantity && group.maximumQuantity > 0 && 
              currentTotalItems + quantity > group.maximumQuantity) {
            // Don't add if it would exceed maximum
            return prev;
          }
          
          updatedItems = [...currentItems, { ...complement, quantity }];
        } else {
          updatedItems = currentItems;
        }
      }
      
      const newState = { ...prev, [groupId]: updatedItems };
      
      // Notify parent component about the selection
      onSelect(groupId, updatedItems);
      
      return newState;
    });
  };

  const getTotalByGroup = (groupId: number) => {
    const items = selectedComplements[groupId] || [];
    return items.reduce((sum, item) => 
      sum + (item.price * (item.quantity || 1)), 0
    );
  };

  const getSelectedCountByGroup = (groupId: number) => {
    const items = selectedComplements[groupId] || [];
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",");
  };

  return (
    <div className="space-y-4 mt-4">
      <Accordion type="single" collapsible className="w-full">
        {complementGroups.map(({ group, complements, isRequired }) => (
          <AccordionItem key={group.id} value={group.id.toString()}>
            <AccordionTrigger className="text-left px-2">
              <div className="flex justify-between w-full items-center pr-2">
                <div>
                  <span className="font-medium">{group.name}</span>
                  {isRequired && (
                    <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 border-red-200">
                      Obrigatório
                    </Badge>
                  )}
                  {group.minimumQuantity > 0 && (
                    <span className="text-xs text-gray-500 block">
                      Mínimo: {group.minimumQuantity}
                    </span>
                  )}
                  {group.maximumQuantity > 0 && (
                    <span className="text-xs text-gray-500 block">
                      Máximo: {group.maximumQuantity}
                    </span>
                  )}
                </div>
                
                <div className="text-right">
                  <span className="text-sm font-medium">
                    {getSelectedCountByGroup(group.id)} selecionados
                  </span>
                  {getTotalByGroup(group.id) > 0 && (
                    <span className="text-xs text-menu-accent block">
                      + R$ {formatPrice(getTotalByGroup(group.id))}
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-2">
              <div className="space-y-3">
                {complements.map((complement) => {
                  const isSelected = Boolean(
                    selectedComplements[group.id]?.find(
                      (item) => item.id === complement.id
                    )
                  );
                  
                  const currentQuantity = selectedComplements[group.id]?.find(
                    (item) => item.id === complement.id
                  )?.quantity || 0;
                  
                  if (group.groupType === 'ingredients' || group.groupType === 'specifications') {
                    // Use checkboxes for ingredients and specifications
                    return (
                      <div key={complement.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`complement-${group.id}-${complement.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              handleComplementSelect(
                                group.id,
                                complement,
                                checked ? 1 : -1
                              );
                            }}
                          />
                          <label
                            htmlFor={`complement-${group.id}-${complement.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {complement.name}
                          </label>
                        </div>
                        
                        {complement.price > 0 && (
                          <span className="text-sm text-menu-accent">
                            + R$ {formatPrice(complement.price)}
                          </span>
                        )}
                      </div>
                    );
                  } else {
                    // Use quantity inputs for cross_sell and disposables
                    return (
                      <div key={complement.id} className="flex items-center justify-between py-1">
                        <div className="flex flex-1">
                          <span className="text-sm">{complement.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {complement.price > 0 && (
                            <span className="text-sm text-menu-accent mr-2">
                              R$ {formatPrice(complement.price)}
                            </span>
                          )}
                          
                          <button
                            type="button"
                            className="rounded-full w-6 h-6 flex items-center justify-center border border-gray-300 text-gray-500 disabled:opacity-50"
                            onClick={() => handleComplementSelect(group.id, complement, -1)}
                            disabled={!isSelected}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          
                          <span className="w-8 text-center text-sm">
                            {currentQuantity}
                          </span>
                          
                          <button
                            type="button"
                            className="rounded-full w-6 h-6 flex items-center justify-center border border-menu-accent text-menu-accent"
                            onClick={() => handleComplementSelect(group.id, complement, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ProductComplementSelector;
