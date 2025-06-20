
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  // Filter active items
  const activeCategories = categories.filter((cat) => cat.isActive);
  const activeProducts = products.filter((prod) => prod.isActive);

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

  // Get placeholder image for category
  const getCategoryPlaceholder = (categoryName: string) => {
    return `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=200&fit=crop&crop=center`;
  };

  // Get placeholder image for product
  const getProductPlaceholder = (productName: string) => {
    return `https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=120&h=120&fit=crop&crop=center`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-32">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header do Menu */}
        <div className="text-center mb-8 bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{menuName}</h1>
          <p className="text-lg text-gray-600">{slogan}</p>
        </div>

        {/* Categorias e Produtos */}
        {activeCategories.map((category) => {
          const categoryProducts = activeProducts.filter(
            (product) => product.categoryId === category.id
          );

          if (categoryProducts.length === 0) return null;

          return (
            <div key={category.id} className="mb-12">
              {/* Header da Categoria com Imagem */}
              <div 
                className="relative h-48 rounded-lg overflow-hidden mb-6 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${getCategoryPlaceholder(category.name)})`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-4xl font-bold text-white text-center px-4">
                    {category.name}
                  </h2>
                </div>
              </div>

              {/* Grid de Produtos */}
              <div className="grid gap-4">
                {categoryProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        {/* Imagem do Produto */}
                        <div className="w-32 h-32 flex-shrink-0">
                          <img
                            src={product.image_url || getProductPlaceholder(product.name)}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-l-lg"
                          />
                        </div>

                        {/* Informações do Produto */}
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {product.name}
                            </h3>
                            
                            {product.description && (
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                {product.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-green-600">
                              R$ {formatPrice(product.price)}
                            </div>
                            
                            <Button 
                              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium"
                              onClick={() => openProductDialog(product)}
                            >
                              Pedir
                            </Button>
                          </div>
                        </div>
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
        <div className="fixed bottom-[80px] left-0 w-full bg-white border-t border-gray-200 py-3 px-4 text-center text-sm text-gray-600 shadow-lg">
          {restaurantAddress && (
            <p className="flex items-center justify-center mb-1">
              <MapPin className="h-4 w-4 mr-1 text-gray-500" />
              {restaurantAddress}
            </p>
          )}
          {whatsappNumber && (
            <p className="flex items-center justify-center">
              <Phone className="h-4 w-4 mr-1 text-green-600" />
              <a 
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`} 
                className="text-green-600 hover:underline font-medium"
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
        className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ${
          cartOpen ? "max-h-[60vh] overflow-y-auto" : "max-h-[80px]"
        }`}
      >
        <div
          className="flex justify-between items-center p-4 bg-red-500 text-white cursor-pointer hover:bg-red-600 transition-colors"
          onClick={() => setCartOpen(!cartOpen)}
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6" />
            <span className="font-bold text-lg">Carrinho</span>
            <span className="bg-red-600 text-white px-2 py-1 rounded-full text-sm">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <span className="font-bold text-xl">R$ {formatPrice(getTotalPrice())}</span>
        </div>

        <div className="p-4">
          {cart.length > 0 ? (
            <>
              <div className="space-y-4 mb-4">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="py-3 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg bg-gray-100 px-2 py-1 rounded">
                          {item.quantity}x
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-green-600">
                          R$ {formatPrice(item.price * item.quantity)}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() => removeFromCart(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-green-500 text-green-500 hover:bg-green-50"
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
                      <div className="ml-8 mt-2 text-sm text-gray-500">
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

              <div className="flex justify-between items-center py-4 mb-4 border-t-2 border-gray-200">
                <span className="font-bold text-xl">Total:</span>
                <span className="font-bold text-2xl text-green-600">
                  R$ {formatPrice(getTotalPrice())}
                </span>
              </div>

              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={clearCart} 
                  className="border-red-500 text-red-500 hover:bg-red-50 px-6 py-3"
                >
                  Limpar
                </Button>
                <Button 
                  onClick={finishOrder} 
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-medium"
                >
                  Finalizar Pedido
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg">Seu carrinho está vazio</p>
              <p className="text-sm">Adicione produtos para começar seu pedido</p>
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
