
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  isActive: boolean;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}
