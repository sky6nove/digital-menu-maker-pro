
import React from "react";
import { 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ComplementCheckbox } from "./ComplementCheckbox";
import { ComplementQuantity } from "./ComplementQuantity";
import { GroupAccordionItemProps } from "./types";

export const GroupAccordionItem: React.FC<GroupAccordionItemProps> = ({
  groupInfo,
  selectedComplements,
  onComplementSelect,
  getTotalByGroup,
  getSelectedCountByGroup,
  formatPrice
}) => {
  const { group, complements, isRequired } = groupInfo;
  
  return (
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
          {/* Ensure complements is defined and not empty before mapping */}
          {complements && complements.length > 0 ? (
            complements.map((complement) => {
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
                  <ComplementCheckbox
                    key={complement.id}
                    groupId={group.id}
                    complement={complement}
                    isSelected={isSelected}
                    onSelect={onComplementSelect}
                    formatPrice={formatPrice}
                  />
                );
              } else {
                // Use quantity inputs for cross_sell and disposables
                return (
                  <ComplementQuantity
                    key={complement.id}
                    groupId={group.id}
                    complement={complement}
                    currentQuantity={currentQuantity}
                    onSelect={onComplementSelect}
                    formatPrice={formatPrice}
                  />
                );
              }
            })
          ) : (
            <div className="py-4 text-center text-gray-500">
              Nenhum complemento disponível neste grupo
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
