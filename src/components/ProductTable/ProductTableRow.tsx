import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import ProductImageThumbnail from "@/components/ProductImageThumbnail";
import DeleteProductDialog from "./DeleteProductDialog";

interface ProductTableRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

const ProductTableRow = ({ product, onEdit, onDelete }: ProductTableRowProps) => {
  return (
    <TableRow key={product.id}>
      <TableCell>
        <ProductImageThumbnail
          imageUrl={product.image_url}
          productName={product.name}
          className="w-12 h-12"
        />
      </TableCell>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell className="max-w-xs">
        <p className="truncate text-sm text-muted-foreground">
          {product.description || "Sem descrição"}
        </p>
      </TableCell>
      <TableCell>
        R$ {product.price.toFixed(2).replace('.', ',')}
      </TableCell>
      <TableCell>
        <Badge variant={product.isActive ? "default" : "secondary"}>
          {product.isActive ? "Ativo" : "Inativo"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteProductDialog product={product} onDelete={onDelete} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProductTableRow;