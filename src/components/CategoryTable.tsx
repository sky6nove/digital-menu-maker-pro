
import { Category } from "../types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X, Check, Trash, Edit, ArrowUp, ArrowDown } from "lucide-react";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onMoveUp?: (id: number) => void;
  onMoveDown?: (id: number) => void;
}

const CategoryTable = ({ categories, onEdit, onDelete, onMoveUp, onMoveDown }: CategoryTableProps) => {
  const getCategoryTypeBadge = (type: string) => {
    if (type === 'pizza') {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
          Pizza
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
        Itens Principais
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length > 0 ? (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{getCategoryTypeBadge(category.categoryType)}</TableCell>
                <TableCell>
                  {category.isActive ? (
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
                    {onMoveUp && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMoveUp(category.id)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                    )}
                    {onMoveDown && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMoveDown(category.id)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(category.id)}
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
              <TableCell colSpan={5} className="text-center py-6">
                Nenhuma categoria encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryTable;
