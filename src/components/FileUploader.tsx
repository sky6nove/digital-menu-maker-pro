import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Image as ImageIcon, Link, Loader2, RefreshCw, Settings, CheckCircle } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
}

const FileUploader = ({ onUploadComplete, currentImageUrl }: FileUploaderProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [fixingPolicies, setFixingPolicies] = useState(false);
  const [policiesStatus, setPoliciesStatus] = useState<'unknown' | 'working' | 'needs_fix'>('unknown');
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with current image URL if provided
  useEffect(() => {
    if (currentImageUrl) {
      console.log("FileUploader: Initializing with current image URL:", currentImageUrl);
      setImageUrl(currentImageUrl);
      setImageUrlInput(currentImageUrl);
    }
  }, [currentImageUrl]);

  // Check policies status on mount
  useEffect(() => {
    if (user) {
      checkPoliciesStatus();
    }
  }, [user]);

  const checkPoliciesStatus = async () => {
    try {
      console.log("FileUploader: Verificando status das políticas...");
      
      const { data, error } = await supabase.functions.invoke('fix-storage-policies');
      
      if (error) {
        console.error("FileUploader: Erro ao verificar políticas:", error);
        setPoliciesStatus('needs_fix');
        return;
      }
      
      console.log("FileUploader: Status das políticas:", data);
      
      if (data?.details?.upload_test === 'success') {
        setPoliciesStatus('working');
      } else {
        setPoliciesStatus('needs_fix');
      }
      
    } catch (error: any) {
      console.error("FileUploader: Erro ao verificar políticas:", error);
      setPoliciesStatus('needs_fix');
    }
  };

  const fixStoragePolicies = async () => {
    setFixingPolicies(true);
    try {
      console.log("FileUploader: Calling fix-storage-policies edge function...");
      
      const { data, error } = await supabase.functions.invoke('fix-storage-policies');
      
      if (error) {
        console.error("FileUploader: Error calling fix-storage-policies:", error);
        throw error;
      }
      
      console.log("FileUploader: Storage policies check result:", data);
      
      if (data?.details?.upload_test === 'success') {
        setPoliciesStatus('working');
        toast({
          title: "Políticas verificadas",
          description: "As políticas de storage estão funcionando corretamente.",
        });
      } else {
        setPoliciesStatus('needs_fix');
        toast({
          title: "Políticas precisam de correção",
          description: "As políticas ainda não estão funcionando. Tente fazer upload para testar.",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error("FileUploader: Error fixing storage policies:", error);
      setPoliciesStatus('needs_fix');
      toast({
        title: "Erro ao verificar políticas",
        description: error.message || "Não foi possível verificar as políticas de storage.",
        variant: "destructive",
      });
    } finally {
      setFixingPolicies(false);
    }
  };

  const uploadFileWithRetry = async (file: File, attempt = 0): Promise<string> => {
    const maxRetries = 3;
    
    try {
      console.log(`FileUploader: Upload attempt ${attempt + 1} for file: ${file.name}`);
      console.log("FileUploader: User authenticated:", !!user, "User ID:", user?.id);
      console.log("FileUploader: Policies status:", policiesStatus);
      
      // Check authentication before attempting upload
      if (!user) {
        throw new Error("Usuário não autenticado. Faça login para fazer upload de imagens.");
      }
      
      // Verify session is valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("FileUploader: Session error:", sessionError);
        throw new Error("Sessão inválida. Faça login novamente.");
      }
      
      console.log("FileUploader: Session valid, proceeding with upload");
      console.log("FileUploader: Session details:", {
        user_id: session.user?.id,
        access_token: session.access_token ? "present" : "missing",
        expires_at: session.expires_at
      });
      
      // Generate unique filename
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
      
      console.log(`FileUploader: Uploading to storage with filename: ${fileName}`);
      console.log("FileUploader: File details:", {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("FileUploader: Storage upload error:", error);
        console.error("FileUploader: Full error object:", JSON.stringify(error, null, 2));
        
        // More detailed error handling
        if (error.message && error.message.includes('row-level security')) {
          setPoliciesStatus('needs_fix');
          throw new Error("Erro de permissão: As políticas de segurança impedem o upload. Clique em 'Verificar Políticas' e tente novamente.");
        } else if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
          throw new Error("Erro de autenticação: Faça login novamente e tente novamente.");
        } else if (error.message && error.message.includes('413')) {
          throw new Error("Arquivo muito grande: O tamanho máximo permitido é 5MB.");
        } else {
          throw new Error(`Erro no upload: ${error.message || 'Erro desconhecido'}`);
        }
      }

      console.log("FileUploader: Upload successful, data:", data);
      setPoliciesStatus('working'); // Mark policies as working after successful upload

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      console.log("FileUploader: Generated public URL:", publicUrl);
      
      // Verify the URL is accessible with a quick test
      try {
        const testResponse = await fetch(publicUrl, { method: 'HEAD' });
        console.log("FileUploader: URL accessibility test:", testResponse.status, testResponse.ok);
        
        if (!testResponse.ok && testResponse.status !== 404) {
          console.warn("FileUploader: URL may not be immediately accessible, but continuing...");
        }
      } catch (testError) {
        console.warn("FileUploader: URL test failed, but continuing:", testError);
      }

      return publicUrl;
      
    } catch (error: any) {
      console.error(`FileUploader: Upload attempt ${attempt + 1} failed:`, error);
      console.error("FileUploader: Error details:", {
        message: error.message,
        error: error.error,
        stack: error.stack
      });
      
      if (attempt < maxRetries - 1) {
        console.log(`FileUploader: Retrying upload... (${attempt + 2}/${maxRetries})`);
        setRetryCount(attempt + 1);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
        return uploadFileWithRetry(file, attempt + 1);
      } else {
        throw error; // Re-throw the original error with full details
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    console.log("FileUploader: File selected:", file.name, "Size:", file.size, "Type:", file.type);

    // Check authentication first
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para fazer upload de imagens.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error("FileUploader: Invalid file type:", file.type);
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas imagens.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error("FileUploader: File too large:", file.size);
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
      console.log("FileUploader: Starting upload process...");

      const publicUrl = await uploadFileWithRetry(file);
      console.log("FileUploader: Upload completed successfully, URL:", publicUrl);

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
      console.error("FileUploader: Final upload error:", error);
      
      // Show specific error messages
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
    
    console.log("FileUploader: Setting external image URL:", imageUrlInput);
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
      console.log("FileUploader: Refreshing image URL:", refreshUrl);
      setImageUrl(refreshUrl);
    }
  };

  const getPoliciesStatusColor = () => {
    switch (policiesStatus) {
      case 'working': return 'text-green-600';
      case 'needs_fix': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPoliciesStatusText = () => {
    switch (policiesStatus) {
      case 'working': return 'Funcionando';
      case 'needs_fix': return 'Precisa correção';
      default: return 'Verificando...';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Upload de Imagem</Label>
          {policiesStatus === 'working' && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <span className={`text-xs ${getPoliciesStatusColor()}`}>
            ({getPoliciesStatusText()})
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fixingPolicies ? undefined : fixStoragePolicies}
          disabled={fixingPolicies}
          className="flex items-center gap-2"
        >
          {fixingPolicies ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Settings className="h-3 w-3" />
          )}
          {fixingPolicies ? "Verificando..." : "Verificar Políticas"}
        </Button>
      </div>

      {/* Authentication status indicator */}
      {!user && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            ⚠️ Você precisa estar logado para fazer upload de arquivos. Use a aba URL para definir uma imagem externa.
          </p>
        </div>
      )}
      
      {/* Policies status indicator */}
      {user && policiesStatus === 'needs_fix' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            ⚠️ As políticas de storage podem estar com problema. Clique em "Verificar Políticas" antes de fazer upload.
          </p>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2" disabled={!user}>
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
                disabled={uploading || !user}
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
                console.error("FileUploader: Error loading preview image:", imageUrl);
                toast({
                  title: "Erro ao carregar imagem",
                  description: "Não foi possível carregar a imagem. Verifique a URL.",
                  variant: "destructive",
                });
              }}
              onLoad={() => {
                console.log("FileUploader: Preview image loaded successfully:", imageUrl);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
