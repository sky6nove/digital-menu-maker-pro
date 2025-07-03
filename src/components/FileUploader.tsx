
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, Link, Loader2, RefreshCw } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
}

const FileUploader = ({ onUploadComplete, currentImageUrl }: FileUploaderProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with current image URL if provided
  useEffect(() => {
    if (currentImageUrl) {
      setImageUrl(currentImageUrl);
      setImageUrlInput(currentImageUrl);
    }
  }, [currentImageUrl]);

  const uploadFileWithRetry = async (file: File, attempt = 0): Promise<string> => {
    const maxRetries = 3;
    
    try {
      // Generate unique filename
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
      
      console.log(`Upload attempt ${attempt + 1} for file: ${fileName}`);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      console.log("Upload successful:", data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      console.log("Public URL generated:", publicUrl);
      
      // Verify the URL is accessible
      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
        throw new Error(`URL not accessible: ${testResponse.status}`);
      }

      return publicUrl;
      
    } catch (error: any) {
      console.error(`Upload attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        console.log(`Retrying upload... (${attempt + 2}/${maxRetries})`);
        setRetryCount(attempt + 1);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
        return uploadFileWithRetry(file, attempt + 1);
      } else {
        throw new Error(`Upload failed after ${maxRetries} attempts: ${error.message}`);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas imagens.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setRetryCount(0);

      const publicUrl = await uploadFileWithRetry(file);

      setImageUrl(publicUrl);
      setImageUrlInput(publicUrl);
      onUploadComplete(publicUrl);

      toast({
        title: "Upload concluído",
        description: "A imagem foi carregada com sucesso.",
      });
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload do arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setRetryCount(0);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrlInput.trim()) {
      toast({
        title: "URL vazia",
        description: "Por favor, insira uma URL de imagem válida.",
        variant: "destructive",
      });
      return;
    }
    
    // Simple URL validation
    try {
      new URL(imageUrlInput);
    } catch (err) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Setting image URL:", imageUrlInput);
    setImageUrl(imageUrlInput);
    onUploadComplete(imageUrlInput);
    
    toast({
      title: "URL definida",
      description: "A URL da imagem foi definida com sucesso.",
    });
  };

  const refreshImage = () => {
    if (imageUrl) {
      // Force refresh by adding timestamp
      const refreshUrl = imageUrl.includes('?') 
        ? `${imageUrl}&t=${Date.now()}` 
        : `${imageUrl}?t=${Date.now()}`;
      setImageUrl(refreshUrl);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            URL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Imagem</Label>
              <Input
                id="picture"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={uploading}
                className="cursor-pointer"
              />
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  Enviando imagem...
                  {retryCount > 0 && ` (Tentativa ${retryCount + 1})`}
                </span>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="url" className="space-y-4">
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="imageUrl">URL da imagem</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">Definir</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Cole a URL completa de uma imagem disponível na internet
              </p>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {imageUrl && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <Label>Pré-visualização</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refreshImage}
              className="h-8 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          <div className="mt-2 border rounded-md p-2 bg-muted/30">
            <img
              src={imageUrl}
              alt="Preview"
              className="mx-auto max-h-48 object-contain"
              key={imageUrl} // Force re-render when URL changes
              onError={(e) => {
                console.error("Error loading image:", imageUrl);
                toast({
                  title: "Erro ao carregar imagem",
                  description: "Não foi possível carregar a imagem. Verifique a URL.",
                  variant: "destructive",
                });
              }}
              onLoad={() => {
                console.log("Image loaded successfully:", imageUrl);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
