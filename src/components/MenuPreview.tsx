
import { Product, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MapPin, Clock } from "lucide-react";
import ProductImageThumbnail from "./ProductImageThumbnail";

interface MenuPreviewProps {
  products: Product[];
  categories: Category[];
  menuName: string;
  slogan: string;
  whatsappNumber: string;
  restaurantAddress: string;
}

const MenuPreview = ({ 
  products, 
  categories, 
  menuName, 
  slogan, 
  whatsappNumber, 
  restaurantAddress 
}: MenuPreviewProps) => {
  const activeProducts = products.filter(p => p.isActive);
  const activeCategories = categories.filter(c => c.isActive);

  const handleWhatsAppOrder = (product: Product) => {
    if (!whatsappNumber) return;
    
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const message = `Olá! Gostaria de pedir: ${product.name} - R$ ${product.price.toFixed(2).replace('.', ',')}`;
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{menuName}</h1>
          <p className="text-xl text-gray-600 mb-4">{slogan}</p>
          
          {restaurantAddress && (
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{restaurantAddress}</span>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Peça pelo WhatsApp</span>
          </div>
        </div>

        {/* Categories and Products */}
        <div className="space-y-8">
          {activeCategories.map((category) => {
            const categoryProducts = activeProducts.filter(p => p.categoryId === category.id);
            
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category.id} className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-1">{category.name}</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
                      <CardContent className="p-0">
                        <div className="relative">
                          {product.image_url ? (
                            <div className="h-48 bg-gray-100">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error("❌ MenuPreview: Erro ao carregar imagem:", product.image_url);
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = `
                                    <div class="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                      <div class="text-center text-gray-400">
                                        <svg class="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <p class="text-sm">Sem imagem</p>
                                      </div>
                                    </div>
                                  `;
                                }}
                                onLoad={() => {
                                  console.log("✅ MenuPreview: Imagem carregada com sucesso:", product.image_url);
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <div className="text-center text-gray-400">
                                <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm">Sem imagem</p>
                              </div>
                            </div>
                          )}
                          
                          {product.hasStockControl && product.stockQuantity <= 5 && (
                            <Badge className="absolute top-2 right-2 bg-red-500">
                              {product.stockQuantity === 0 ? "Esgotado" : `Últimas ${product.stockQuantity}`}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.name}</h3>
                            {product.description && (
                              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-green-600">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                            
                            {whatsappNumber && (
                              <Button 
                                onClick={() => handleWhatsAppOrder(product)}
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                disabled={product.hasStockControl && product.stockQuantity === 0}
                              >
                                <MessageCircle className="h-4 w-4" />
                                {product.hasStockControl && product.stockQuantity === 0 ? "Esgotado" : "Pedir"}
                              </Button>
                            )}
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

        {activeProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Menu em construção</h3>
            <p className="text-gray-500">Os produtos estarão disponíveis em breve!</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-500 text-sm">
            Feito com ❤️ para oferecer a melhor experiência gastronômica
          </p>
        </div>
      </div>
    </div>
  );
};

export default MenuPreview;
