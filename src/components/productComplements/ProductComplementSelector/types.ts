
import { ComplementGroup, ComplementItem } from "@/types";

export interface ComplementGroupWithItems {
  group: ComplementGroup;
  complements: ComplementItem[];
  isRequired: boolean;
}

export interface ProductComplementSelectorProps {
  complementGroups: ComplementGroupWithItems[];
  onSelect: (groupId: number, selectedItems: ComplementItem[]) => void;
}

export interface GroupAccordionItemProps {
  groupInfo: ComplementGroupWithItems;
  selectedComplements: { [groupId: number]: ComplementItem[] };
  onComplementSelect: (groupId: number, complement: ComplementItem, quantity: number) => void;
  getTotalByGroup: (groupId: number) => number;
  getSelectedCountByGroup: (groupId: number) => number;
  formatPrice: (price: number) => string;
}

export interface ComplementCheckboxProps {
  groupId: number;
  complement: ComplementItem;
  isSelected: boolean;
  onSelect: (groupId: number, complement: ComplementItem, quantity: number) => void;
  formatPrice: (price: number) => string;
}

export interface ComplementQuantityProps {
  groupId: number;
  complement: ComplementItem;
  currentQuantity: number;
  onSelect: (groupId: number, complement: ComplementItem, quantity: number) => void;
  formatPrice: (price: number) => string;
}
