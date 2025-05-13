
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product, ComplementItem } from "@/types";
import { useProductMenuComplements } from "@/hooks/useProductMenuComplements";
import ProductComplementSelector from "@/components/ProductComplementSelector";
import { X } from "lucide-react";

interface ProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, selectedComplements: {[groupId: number]: ComplementItem[]}) => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { loading, productComplementGroups } = useProductMenuComplements(product?.id);
  const [selectedComplements, setSelectedComplements] = useState<{[groupId: number]: ComplementItem[]}>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    if (product) {
      setTotalPrice(product.price || 0);
      setSelectedComplements({});
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    
    let total = product.price || 0;
    
    // Add complement prices
    Object.values(selectedComplements).forEach(groupItems => {
      groupItems.forEach(item => {
        total += (item.price || 0) * (item.quantity || 1);
      });
    });
    
    setTotalPrice(total);
  }, [selectedComplements, product]);

  const handleComplementSelect = (groupId: number, selectedItems: ComplementItem[]) => {
    setSelectedComplements(prev => ({
      ...prev,
      [groupId]: selectedItems
    }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if all required groups have their minimum quantity met
    const missingRequired = productComplementGroups.find(({ group, isRequired }) => {
      if (!isRequired) return false;
      
      const groupSelections = selectedComplements[group.id] || [];
      const selectedCount = groupSelections.reduce((sum, item) => sum + (item.quantity || 1), 0);
      
      return selectedCount < (group.minimumQuantity || 0);
    });
    
    if (missingRequired) {
      alert(`Por favor, selecione os itens obrigatórios do grupo "${missingRequired.group.name}"`);
      return;
    }
    
    onAddToCart(product, selectedComplements);
    onClose();
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",");
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{product.name}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="py-2">
          {product.description && (
            <p className="text-sm text-gray-500 mb-3">{product.description}</p>
          )}
          
          {product.image_url && (
            <div className="aspect-video mb-4 overflow-hidden rounded-md">
              <img
                src={product.image_url}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-menu-accent border-t-transparent rounded-full"></div>
            </div>
          ) : productComplementGroups.length > 0 ? (
            <ProductComplementSelector
              complementGroups={productComplementGroups}
              onSelect={handleComplementSelect}
            />
          ) : null}
        </div>
        
        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Total:</span>
            <span className="font-bold text-lg text-menu-accent">R$ {formatPrice(totalPrice)}</span>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-menu-accent hover:bg-opacity-90 text-black"
          >
            Adicionar ao Carrinho
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
