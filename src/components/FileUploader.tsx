
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImagePlus, Upload, X } from "lucide-react";

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  bucketName?: string;
}

const FileUploader = ({ 
  onUploadComplete, 
  currentImageUrl,
  bucketName = "product-images" 
}: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      const publicUrl = data.publicUrl;
      
      // Set preview and call the callback
      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);
      
      toast.success("Imagem carregada com sucesso");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(`Erro ao carregar imagem: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Apenas imagens (JPEG, PNG, GIF, WEBP) são permitidas");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter menos de 5MB");
      return;
    }
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Upload file
    uploadFile(file);
  };

  const handleClearImage = () => {
    setPreviewUrl(null);
    onUploadComplete("");
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative rounded-md overflow-hidden border border-gray-200">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-48 object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full bg-red-500 hover:bg-red-600 p-1 h-8 w-8"
            onClick={handleClearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary transition-colors cursor-pointer" onClick={() => document.getElementById("file-upload")?.click()}>
          <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Clique para carregar uma imagem
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF até 5MB
            </p>
          </div>
        </div>
      )}
      
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      {!previewUrl && (
        <Button
          onClick={() => document.getElementById("file-upload")?.click()}
          variant="outline"
          className="w-full"
          disabled={uploading}
        >
          {uploading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Carregando...
            </span>
          ) : (
            <span className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Selecionar imagem
            </span>
          )}
        </Button>
      )}
    </div>
  );
};

export default FileUploader;
