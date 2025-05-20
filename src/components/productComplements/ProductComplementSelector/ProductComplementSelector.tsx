
import React, { useState, useEffect } from "react";
import {
  Accordion
} from "@/components/ui/accordion";
import { GroupAccordionItem } from "./GroupAccordionItem";
import { ProductComplementSelectorProps } from "./types";
import { ComplementItem } from "@/types";

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
    
    // Ensure complementGroups is defined before mapping over it
    if (complementGroups && complementGroups.length > 0) {
      complementGroups.forEach(({ group, complements, isRequired }) => {
        if (isRequired && group.minimumQuantity && group.minimumQuantity > 0 && complements && complements.length > 0) {
          // Pre-select the first N complements if the group is required, ensuring complements exists and has enough items
          const itemsToSelect = Math.min(group.minimumQuantity, complements.length);
          initialSelections[group.id] = complements.slice(0, itemsToSelect).map(c => ({
            ...c,
            quantity: 1
          }));
        } else {
          initialSelections[group.id] = [];
        }
      });
    }
    
    setSelectedComplements(initialSelections);
  }, [complementGroups]);

  const handleComplementSelect = (groupId: number, complement: ComplementItem, quantity: number = 1) => {
    setSelectedComplements(prev => {
      // Find the group information
      const groupInfo = complementGroups?.find(g => g.group.id === groupId);
      if (!groupInfo) return prev;
      
      const group = groupInfo.group;
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

  // Handle case when complementGroups is undefined or empty
  if (!complementGroups || complementGroups.length === 0) {
    return (
      <div className="space-y-4 mt-4">
        <p className="text-center text-gray-500">Nenhum grupo de complementos disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <Accordion type="single" collapsible className="w-full">
        {complementGroups.map((groupInfo) => (
          <GroupAccordionItem
            key={groupInfo.group.id}
            groupInfo={groupInfo}
            selectedComplements={selectedComplements}
            onComplementSelect={handleComplementSelect}
            getTotalByGroup={getTotalByGroup}
            getSelectedCountByGroup={getSelectedCountByGroup}
            formatPrice={formatPrice}
          />
        ))}
      </Accordion>
    </div>
  );
};

export default ProductComplementSelector;
