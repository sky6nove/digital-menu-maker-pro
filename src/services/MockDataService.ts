
import { Product, Category } from "../types";

// Initial mock data
let categories: Category[] = [
  { id: 1, name: "Hamburguers Simples", isActive: true, order: 0 },
  { id: 2, name: "Hamburguers Especiais", isActive: true, order: 1 },
  { id: 3, name: "Acompanhamentos", isActive: true, order: 2 },
  { id: 4, name: "Bebidas", isActive: true, order: 3 },
];

let products: Product[] = [
  {
    id: 1,
    name: "X-Burguer",
    description: "Pão, hambúrguer, queijo, alface, tomate e maionese",
    price: 12.99,
    categoryId: 1,
    isActive: true,
  },
  {
    id: 2,
    name: "X-Bacon",
    description: "Pão, hambúrguer, queijo, bacon, alface, tomate e maionese",
    price: 14.99,
    categoryId: 1,
    isActive: true,
  },
  {
    id: 3,
    name: "X-Tudo",
    description: "Pão, 2 hambúrgueres, queijo, bacon, ovo, calabresa, alface, tomate e maionese",
    price: 19.99,
    categoryId: 2,
    isActive: true,
  },
  {
    id: 4,
    name: "Batata Frita P",
    description: "Porção de batata frita pequena",
    price: 7.99,
    categoryId: 3,
    isActive: true,
  },
  {
    id: 5,
    name: "Refrigerante Lata",
    description: "Coca-Cola, Pepsi, Guaraná ou Fanta",
    price: 5.99,
    categoryId: 4,
    isActive: true,
  },
];

// Unique ID generator
const generateId = (items: Array<{ id: number }>) => {
  const maxId = items.reduce((max, item) => (item.id > max ? item.id : max), 0);
  return maxId + 1;
};

// Product Service
export const ProductService = {
  getAllProducts: (): Promise<Product[]> => {
    return Promise.resolve([...products]);
  },

  getProductById: (id: number): Promise<Product | undefined> => {
    const product = products.find((p) => p.id === id);
    return Promise.resolve(product);
  },

  createProduct: (product: Omit<Product, "id">): Promise<Product> => {
    const newProduct = {
      ...product,
      id: generateId(products),
    };
    products.push(newProduct);
    return Promise.resolve(newProduct);
  },

  updateProduct: (id: number, updatedFields: Partial<Product>): Promise<Product | null> => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return Promise.resolve(null);
    }

    products[index] = { ...products[index], ...updatedFields };
    return Promise.resolve(products[index]);
  },

  deleteProduct: (id: number): Promise<boolean> => {
    const initialLength = products.length;
    products = products.filter((p) => p.id !== id);
    return Promise.resolve(products.length !== initialLength);
  },
};

// Category Service
export const CategoryService = {
  getAllCategories: (): Promise<Category[]> => {
    return Promise.resolve([...categories]);
  },

  getCategoryById: (id: number): Promise<Category | undefined> => {
    const category = categories.find((c) => c.id === id);
    return Promise.resolve(category);
  },

  createCategory: (category: Omit<Category, "id">): Promise<Category> => {
    const newCategory = {
      ...category,
      id: generateId(categories),
    };
    categories.push(newCategory);
    return Promise.resolve(newCategory);
  },

  updateCategory: (id: number, updatedFields: Partial<Category>): Promise<Category | null> => {
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return Promise.resolve(null);
    }

    categories[index] = { ...categories[index], ...updatedFields };
    return Promise.resolve(categories[index]);
  },

  deleteCategory: (id: number): Promise<boolean> => {
    const initialLength = categories.length;
    categories = categories.filter((c) => c.id !== id);
    return Promise.resolve(categories.length !== initialLength);
  },
};
