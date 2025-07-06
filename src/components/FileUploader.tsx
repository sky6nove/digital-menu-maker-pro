
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Image as ImageIcon, Link, Loader2, RefreshCw, Settings, CheckCircle, AlertCircle } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
}

const FileUploader = ({ onUploadComplete, currentImageUrl }: FileUploaderProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [checkingPolicies, setCheckingPolicies] = useState(false);
  const [policiesStatus, setPoliciesStatus] = useState<'unknown' | 'working' | 'needs_fix'>('unknown');
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with current image URL if provided
  useEffect(() => {
    if (currentImageUrl) {
      console.log("🖼️ FileUploader: Inicializando com imagem atual:", currentImageUrl);
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
    if (!user) {
      setPoliciesStatus('needs_fix');
      return;
    }

    setCheckingPolicies(true);
    try {
      console.log("🔍 FileUploader: Verificando status das políticas...");
      
      const { data, error } = await supabase.functions.invoke('fix-storage-policies');
      
      if (error) {
        console.error("❌ FileUploader: Erro ao verificar políticas:", error);
        setPoliciesStatus('needs_fix');
        return;
      }
      
      console.log("📊 FileUploader: Status das políticas:", data);
      
      if (data?.success && data?.details?.upload_test === 'success') {
        setPoliciesStatus('working');
        console.log("✅ Políticas funcionando corretamente");
      } else {
        setPoliciesStatus('needs_fix');
        console.log("⚠️ Políticas precisam de correção:", data?.details?.upload_test);
      }
      
    } catch (error: any) {
      console.error("💥 FileUploader: Erro ao verificar políticas:", error);
      setPoliciesStatus('needs_fix');
    } finally {
      setCheckingPolicies(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    console.log("📁 FileUploader: Arquivo selecionado:", file.name, "Tamanho:", file.size, "Tipo:", file.type);

    // Check authentication first
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para fazer upload de imagens.",
        variant: "destructive",
      });
      return;
    }

    // Check policies before upload
    if (policiesStatus !== 'working') {
      toast({
        title: "Verificação necessária",
        description: "Clique em 'Verificar Políticas' antes de fazer upload.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error("❌ FileUploader: Tipo de arquivo inválido:", file.type);
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas imagens.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error("❌ FileUploader: Arquivo muito grande:", file.size);
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      console.log("🚀 FileUploader: Iniciando processo de upload...");

      // Verify session is valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("❌ FileUploader: Erro de sessão:", sessionError);
        throw new Error("Sessão inválida. Faça login novamente.");
      }

      // Generate unique filename
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
      
      console.log(`📤 FileUploader: Upload para storage com nome: ${fileName}`);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("❌ FileUploader: Erro no storage:", error);
        
        if (error.message?.includes('row-level security')) {
          setPoliciesStatus('needs_fix');
          throw new Error("Erro de permissão: Clique em 'Verificar Políticas' e tente novamente.");
        } else if (error.message?.includes('401') || error.message?.includes('403')) {
          throw new Error("Erro de autenticação: Faça login novamente.");
        } else if (error.message?.includes('413')) {
          throw new Error("Arquivo muito grande: O tamanho máximo é 5MB.");
        } else {
          throw new Error(`Erro no upload: ${error.message}`);
        }
      }

      console.log("✅ FileUploader: Upload concluído com sucesso:", data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      console.log("🔗 FileUploader: URL pública gerada:", publicUrl);

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
      console.error("💥 FileUploader: Erro final no upload:", error);
      
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload do arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
    
    console.log("🔗 FileUploader: Definindo URL externa:", imageUrlInput);
    setImageUrl(imageUrlInput);
    onUploadComplete(imageUrlInput);
    
    toast({
      title: "URL definida",
      description: "A URL da imagem foi definida com sucesso.",
    });
  };

  const refreshImage = () => {
    if (imageUrl) {
      const refreshUrl = imageUrl.includes('?') 
        ? `${imageUrl}&t=${Date.now()}` 
        : `${imageUrl}?t=${Date.now()}`;
      console.log("🔄 FileUploader: Atualizando imagem:", refreshUrl);
      setImageUrl(refreshUrl);
    }
  };

  const getPoliciesStatusIcon = () => {
    switch (policiesStatus) {
      case 'working': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'needs_fix': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPoliciesStatusText = () => {
    switch (policiesStatus) {
      case 'working': return 'Funcionando';
      case 'needs_fix': return 'Precisa correção';
      default: return 'Verificando...';
    }
  };

  const getPoliciesStatusColor = () => {
    switch (policiesStatus) {
      case 'working': return 'text-green-600';
      case 'needs_fix': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Upload de Imagem</Label>
          {getPoliciesStatusIcon()}
          <span className={`text-xs ${getPoliciesStatusColor()}`}>
            ({getPoliciesStatusText()})
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={checkingPolicies ? undefined : checkPoliciesStatus}
          disabled={checkingPolicies}
          className="flex items-center gap-2"
        >
          {checkingPolicies ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Settings className="h-3 w-3" />
          )}
          {checkingPolicies ? "Verificando..." : "Verificar Políticas"}
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
            ⚠️ As políticas de storage estão com problema. Clique em "Verificar Políticas" antes de fazer upload.
          </p>
        </div>
      )}
      
      {user && policiesStatus === 'working' && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            ✅ Políticas funcionando corretamente. Você pode fazer upload.
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
                disabled={uploading || !user || policiesStatus !== 'working'}
                className="cursor-pointer"
              />
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Enviando imagem...</span>
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
              key={imageUrl}
              onError={(e) => {
                console.error("❌ FileUploader: Erro ao carregar preview:", imageUrl);
                toast({
                  title: "Erro ao carregar imagem",
                  description: "Não foi possível carregar a imagem. Verifique a URL.",
                  variant: "destructive",
                });
              }}
              onLoad={() => {
                console.log("✅ FileUploader: Preview carregado com sucesso:", imageUrl);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
