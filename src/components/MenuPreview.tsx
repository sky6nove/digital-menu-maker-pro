
import { useState, useEffect } from "react";
import { Product, Category, CartItem, ComplementItem, CartItemComplement } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, ShoppingCart, MapPin, Phone, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductDialog from "@/components/ProductDialog";

interface MenuPreviewProps {
  products: Product[];
  categories: Category[];
  menuName?: string;
  slogan?: string;
  whatsappNumber?: string;
  restaurantAddress?: string;
}

const MenuPreview = ({ 
  products, 
  categories, 
  menuName = "CARDÁPIO Burguers",
  slogan = "Sabor sem igual!",
  whatsappNumber = "",
  restaurantAddress = ""
}: MenuPreviewProps) => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  // Filter active items
  const activeCategories = categories.filter((cat) => cat.isActive);
  const activeProducts = products.filter((prod) => prod.isActive);

  const toggleDescription = (productId: number) => {
    setExpandedDescriptions({
      ...expandedDescriptions,
      [productId]: !expandedDescriptions[productId],
    });
  };

  const openProductDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  const closeProductDialog = () => {
    setIsProductDialogOpen(false);
    setSelectedProduct(null);
  };

  const addToCart = (product: Product, selectedComplements?: {[groupId: number]: ComplementItem[]}) => {
    // Create cart item complements from selected complements
    const complements: CartItemComplement[] = [];
    
    if (selectedComplements) {
      Object.entries(selectedComplements).forEach(([groupId, items]) => {
        items.forEach(item => {
          const quantity = item.quantity || 1;
          
          complements.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: quantity,
            groupId: parseInt(groupId),
            groupName: item.groupName
          });
        });
      });
    }
    
    // Calculate total price including complements
    let totalPrice = product.price;
    complements.forEach(item => {
      totalPrice += item.price * item.quantity;
    });

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: totalPrice,
      quantity: 1,
      complements: complements.length > 0 ? complements : undefined,
      selectedComplements: selectedComplements
    };

    // Check if item with same complements exists
    const existingItemIndex = findMatchingCartItemIndex(cartItem);
    
    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Add new item
      setCart([...cart, cartItem]);
    }

    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho`,
    });

    // Open cart when adding first item
    if (cart.length === 0) {
      setCartOpen(true);
    }
  };

  // Helper to find a matching cart item with same complements
  const findMatchingCartItemIndex = (cartItem: CartItem): number => {
    return cart.findIndex(item => {
      if (item.id !== cartItem.id) return false;
      
      // If one has complements and the other doesn't, they don't match
      if (Boolean(item.complements) !== Boolean(cartItem.complements)) return false;
      
      // If neither has complements, they match
      if (!item.complements && !cartItem.complements) return true;
      
      // Compare complements
      const itemComplements = item.complements || [];
      const newItemComplements = cartItem.complements || [];
      
      if (itemComplements.length !== newItemComplements.length) return false;
      
      // Check if all complements match
      return newItemComplements.every(newComp => {
        const matchingComp = itemComplements.find(
          comp => comp.id === newComp.id && comp.groupId === newComp.groupId
        );
        
        return matchingComp && matchingComp.quantity === newComp.quantity;
      });
    });
  };

  const removeFromCart = (index: number) => {
    const updatedCart = [...cart];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
      setCart(updatedCart);
    } else {
      updatedCart.splice(index, 1);
      setCart(updatedCart);
    }
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos do carrinho",
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",");
  };

  const finishOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho antes de finalizar o pedido",
        variant: "destructive",
      });
      return;
    }

    let message = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
    
    cart.forEach((item, index) => {
      message += `${item.quantity}x ${item.name} - R$${formatPrice(item.price * item.quantity)}\n`;
      
      // Add complements details
      if (item.complements && item.complements.length > 0) {
        message += "   Complementos:\n";
        
        // Group complements by group
        const groupedComplements: {[groupId: number]: CartItemComplement[]} = {};
        
        item.complements.forEach(comp => {
          const groupId = comp.groupId || 0;
          if (!groupedComplements[groupId]) {
            groupedComplements[groupId] = [];
          }
          groupedComplements[groupId].push(comp);
        });
        
        // Add each group's complements
        Object.entries(groupedComplements).forEach(([groupId, comps]) => {
          const groupName = comps[0].groupName || "Complementos";
          message += `   - ${groupName}:\n`;
          
          comps.forEach(comp => {
            message += `     ${comp.quantity}x ${comp.name}`;
            if (comp.price > 0) {
              message += ` (+R$${formatPrice(comp.price * comp.quantity)})`;
            }
            message += "\n";
          });
        });
      }
      
      message += "\n";
    });
    
    message += `\nTotal: R$${formatPrice(getTotalPrice())}\n\nNome para o pedido:\nEndereço de entrega:\n`;
    
    // Format WhatsApp number (remove non-numeric characters)
    const formattedWhatsApp = whatsappNumber ? whatsappNumber.replace(/\D/g, "") : "5500000000000";
    
    // Open WhatsApp with the message
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedWhatsApp}?text=${encodedMessage}`, '_blank');
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, "");
    
    if (digits.length === 13) {
      // International format: +55 (11) 99999-9999
      return `+${digits.substring(0, 2)} (${digits.substring(2, 4)}) ${digits.substring(4, 9)}-${digits.substring(9, 13)}`;
    } else if (digits.length === 11) {
      // National format: (11) 99999-9999
      return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
    } else {
      // Return as is if format is unknown
      return phone;
    }
  };

  return (
    <div className="min-h-screen bg-menu-background text-menu-foreground pb-32">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-menu-accent mb-2">{menuName}</h1>
          <p className="text-menu-foreground opacity-75">{slogan}</p>
        </div>

        {activeCategories.map((category) => {
          const categoryProducts = activeProducts.filter(
            (product) => product.categoryId === category.id
          );

          if (categoryProducts.length === 0) return null;

          return (
            <div key={category.id} className="mb-10">
              <h2 className="text-2xl font-bold text-menu-accent mb-4 pb-2 border-b border-menu-accent">
                {category.name}
              </h2>

              <div className="space-y-4">
                {categoryProducts.map((product) => (
                  <Card key={product.id} className="bg-menu-card border-none shadow-md">
                    <CardContent className="p-4">
                      <div 
                        className="flex justify-between items-center cursor-pointer" 
                        onClick={() => toggleDescription(product.id)}
                      >
                        <h3 className="text-xl font-semibold text-menu-foreground">
                          {product.name}
                        </h3>
                        <span className="text-lg font-medium text-menu-accent">
                          R$ {formatPrice(product.price)}
                        </span>
                      </div>

                      {product.description && (
                        <div
                          className={`mt-2 text-menu-foreground opacity-75 text-sm overflow-hidden transition-all duration-300 ${
                            expandedDescriptions[product.id] ? "max-h-24" : "max-h-0"
                          }`}
                        >
                          {product.description}
                        </div>
                      )}

                      <div className="mt-3 flex justify-end">
                        <Button 
                          className="bg-menu-accent hover:bg-opacity-80 text-black"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProductDialog(product);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Adicionar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Restaurant Footer */}
      {(whatsappNumber || restaurantAddress) && (
        <div className="fixed bottom-[50px] left-0 w-full bg-menu-card border-t border-gray-700 py-2 px-4 text-center text-sm text-gray-300">
          {restaurantAddress && (
            <p className="flex items-center justify-center mb-1">
              <MapPin className="h-4 w-4 mr-1 text-menu-accent" />
              {restaurantAddress}
            </p>
          )}
          {whatsappNumber && (
            <p className="flex items-center justify-center">
              <Phone className="h-4 w-4 mr-1 text-menu-accent" />
              <a 
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`} 
                className="text-menu-accent hover:underline"
                target="_blank" 
                rel="noopener noreferrer"
              >
                {formatPhoneNumber(whatsappNumber)}
              </a>
            </p>
          )}
        </div>
      )}

      {/* Fixed Cart */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-menu-card border-t border-menu-accent transition-all duration-300 ${
          cartOpen ? "max-h-[60vh] overflow-y-auto" : "max-h-[56px]"
        }`}
      >
        <div
          className="flex justify-between items-center p-4 bg-menu-accent text-black cursor-pointer"
          onClick={() => setCartOpen(!cartOpen)}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-bold">Carrinho</span>
            <span>({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>
          </div>
          <span className="font-bold">R$ {formatPrice(getTotalPrice())}</span>
        </div>

        <div className="p-4">
          {cart.length > 0 ? (
            <>
              <div className="space-y-3 mb-4">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="py-2 border-b border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>R$ {formatPrice(item.price * item.quantity)}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 border-menu-accent text-menu-accent"
                            onClick={() => removeFromCart(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 border-menu-accent text-menu-accent"
                            onClick={() => {
                              const updatedCart = [...cart];
                              updatedCart[index].quantity += 1;
                              setCart(updatedCart);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Show complements */}
                    {item.complements && item.complements.length > 0 && (
                      <div className="ml-6 mt-1 text-sm text-gray-400">
                        {item.complements.map((comp, compIndex) => (
                          <div key={`${comp.id}-${compIndex}`} className="flex justify-between">
                            <span>{comp.quantity}x {comp.name}</span>
                            {comp.price > 0 && (
                              <span>+R$ {formatPrice(comp.price * comp.quantity)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center py-2 mb-4 border-t border-menu-accent">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg">R$ {formatPrice(getTotalPrice())}</span>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={clearCart} className="border-red-500 text-red-500">
                  Limpar
                </Button>
                <Button onClick={finishOrder} className="bg-menu-accent text-black">
                  Finalizar Pedido
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-gray-400">
              Seu carrinho está vazio
            </div>
          )}
        </div>
      </div>

      {/* Product dialog */}
      <ProductDialog
        product={selectedProduct}
        isOpen={isProductDialogOpen}
        onClose={closeProductDialog}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default MenuPreview;
