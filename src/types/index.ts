export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  isActive: boolean;
  image_url?: string;
  allow_half_half?: boolean;
  half_half_price_rule?: 'lowest' | 'highest' | 'average';
  pdvCode?: string;
  productTypeId?: number;
  dietaryRestrictions?: string[];
  portionSize?: string;
  servesCount?: number;
  hasStockControl?: boolean;
  stockQuantity?: number;
  display_order?: number;
}

export interface Category {
  id: number;
  name: string;
  isActive: boolean;
  order: number;
  allowHalfHalf?: boolean;
  halfHalfPriceRule?: 'lowest' | 'highest' | 'average';
  categoryType: 'regular' | 'pizza';
  hasPortions?: boolean;
  portionsLabel?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size?: ProductSize;
  leftFlavor?: Product;
  rightFlavor?: Product;
  complements?: CartItemComplement[];
  complementGroups?: ProductComplementGroup[];
  selectedComplements?: {[groupId: number]: ComplementItem[]};
}

export interface CartItemComplement {
  id: number;
  name: string;
  price: number;
  quantity: number;
  groupId?: number;
  groupName?: string;
}

export interface ProductSize {
  id: number;
  product_id: number;
  name: string;
  price: number;
  is_default: boolean;
}

export interface Complement {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  isActive: boolean;
  hasStockControl?: boolean;
  stockQuantity?: number;
}

export interface ComplementGroup {
  id: number;
  name: string;
  groupType: 'ingredients' | 'specifications' | 'cross_sell' | 'disposables';
  isActive: boolean;
  imageUrl?: string;
  minimumQuantity?: number;
  maximumQuantity?: number;
  isRequired?: boolean;
}

export interface ProductComplement {
  id: number;
  product_id: number;
  complement_id: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_address?: string;
  customer_phone?: string;
  delivery_method: string;
  payment_method?: string;
  observations?: string;
  status: 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  size_name?: string;
  left_flavor_name?: string;
  right_flavor_name?: string;
  complements?: OrderItemComplement[];
}

export interface OrderItemComplement {
  id: number;
  order_item_id: number;
  complement_id?: number;
  complement_name: string;
  quantity: number;
  unit_price: number;
}

export interface Subscription {
  id: string;
  status: string;
  plan_type: 'monthly' | 'yearly';
  current_period_end?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export interface ProductType {
  id: number;
  name: string;
  isActive: boolean;
}

export interface ComplementItem {
  id: number;
  groupId: number;
  name: string;
  price: number;
  isActive: boolean;
  productId?: number;
  product?: Product;
  quantity?: number;
  customPrice?: number;
  groupName?: string;
}

export interface ProductComplementGroup {
  id: number;
  productId: number;
  complementGroupId: number;
  isRequired: boolean;
}
