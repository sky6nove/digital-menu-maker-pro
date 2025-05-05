
import { useState } from "react";
import { Product, Category } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X, Check, Trash, Edit } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

const ProductTable = ({ products, categories, onEdit, onDelete }: ProductTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  // Filter products based on search term and selected category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === null || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || "Sem categoria";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-1/2">
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategorySelect(null)}
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategorySelect(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                  <TableCell className="text-right">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </TableCell>
                  <TableCell>
                    {product.isActive ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                        <X className="h-3.5 w-3.5 mr-1" />
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductTable;
