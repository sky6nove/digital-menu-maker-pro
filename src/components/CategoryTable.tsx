
import { Category } from "../types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X, Check, Trash, Edit } from "lucide-react";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

const CategoryTable = ({ categories, onEdit, onDelete }: CategoryTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
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
              <TableCell colSpan={4} className="text-center py-6">
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
