
import { useState, useEffect } from "react";
import { Product, Category, CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MenuPreviewProps {
  products: Product[];
  categories: Category[];
  menuName?: string;
}

const MenuPreview = ({ products, categories, menuName = "CARDÁPIO Burguers" }: MenuPreviewProps) => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});

  // Filter active items
  const activeCategories = categories.filter((cat) => cat.isActive);
  const activeProducts = products.filter((prod) => prod.isActive);

  const toggleDescription = (productId: number) => {
    setExpandedDescriptions({
      ...expandedDescriptions,
      [productId]: !expandedDescriptions[productId],
    });
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }]);
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

  const removeFromCart = (id: number) => {
    const item = cart.find((item) => item.id === id);
    
    if (item && item.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    } else {
      setCart(cart.filter((item) => item.id !== id));
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
    
    cart.forEach(item => {
      message += `${item.quantity}x ${item.name} - R$${formatPrice(item.price * item.quantity)}\n`;
    });
    
    message += `\nTotal: R$${formatPrice(getTotalPrice())}\n\nNome para o pedido:\nEndereço de entrega:\n`;
    
    // Open WhatsApp with the message
    const phoneNumber = "5500000000000"; // Replace with actual number
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-menu-background text-menu-foreground pb-24">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-menu-accent mb-2">{menuName}</h1>
          <p className="text-menu-foreground opacity-75">Sabor sem igual!</p>
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
                            addToCart(product);
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
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-700">
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
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 border-menu-accent text-menu-accent"
                          onClick={() => addToCart(activeProducts.find(p => p.id === item.id)!)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
    </div>
  );
};

export default MenuPreview;
