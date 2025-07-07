
import { useState } from "react";
import { Product, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ProductImageThumbnail from "./ProductImageThumbnail";

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAddProduct: (categoryId?: number) => void;
}

const ProductTable = ({ products, categories, onEdit, onDelete, onAddProduct }: ProductTableProps) => {
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Sem categoria";
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      onDelete(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const groupedProducts = categories.reduce((acc, category) => {
    const categoryProducts = products.filter(p => p.categoryId === category.id);
    if (categoryProducts.length > 0) {
      acc[category.id] = {
        category,
        products: categoryProducts
      };
    }
    return acc;
  }, {} as Record<number, { category: Category; products: Product[] }>);

  // Products without category
  const productsWithoutCategory = products.filter(p => 
    !categories.some(c => c.id === p.categoryId)
  );

  return (
    <div className="space-y-6">
      {Object.values(groupedProducts).map(({ category, products: categoryProducts }) => (
        <div key={category.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <Badge variant={category.isActive ? "default" : "secondary"}>
                {categoryProducts.length} produtos
              </Badge>
            </div>
            <Button 
              size="sm" 
              onClick={() => onAddProduct(category.id)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar produto
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-24">Preço</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryProducts.map((product) => (
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setProductToDelete(product)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o produto "{product.name}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setProductToDelete(null)}>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      {productsWithoutCategory.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Produtos sem categoria</h3>
              <Badge variant="secondary">
                {productsWithoutCategory.length} produtos
              </Badge>
            </div>
            <Button 
              size="sm" 
              onClick={() => onAddProduct()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar produto
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-24">Preço</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsWithoutCategory.map((product) => (
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setProductToDelete(product)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o produto "{product.name}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setProductToDelete(null)}>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {Object.keys(groupedProducts).length === 0 && productsWithoutCategory.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Nenhum produto cadastrado ainda.</p>
          <Button onClick={() => onAddProduct()}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar primeiro produto
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
