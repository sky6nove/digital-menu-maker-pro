
import { useState } from "react";
import { Image as ImageIcon, AlertCircle } from "lucide-react";

interface ProductImageThumbnailProps {
  imageUrl?: string;
  productName: string;
  className?: string;
  showFallback?: boolean;
}

const ProductImageThumbnail = ({ 
  imageUrl, 
  productName, 
  className = "w-16 h-16",
  showFallback = true 
}: ProductImageThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    console.error("❌ ProductImageThumbnail: Erro ao carregar imagem:", imageUrl);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log("✅ ProductImageThumbnail: Imagem carregada com sucesso:", imageUrl);
    setImageError(false);
    setImageLoading(false);
  };

  // Show fallback if no image URL, image failed to load, or showFallback is false
  if (!imageUrl || imageError || !showFallback) {
    return (
      <div className={`${className} bg-muted/30 border border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center`}>
        {!imageUrl ? (
          <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
        ) : (
          <AlertCircle className="h-6 w-6 text-muted-foreground/50" />
        )}
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden rounded-md border bg-muted/20`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={`Imagem do produto ${productName}`}
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: imageLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default ProductImageThumbnail;
