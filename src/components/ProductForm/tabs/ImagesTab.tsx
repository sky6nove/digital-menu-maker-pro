
import { Label } from "@/components/ui/label";
import FileUploader from "@/components/FileUploader";

interface ImagesTabProps {
  currentImageUrl: string;
  onUploadComplete: (url: string) => void;
}

const ImagesTab = ({ currentImageUrl, onUploadComplete }: ImagesTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Imagem do Produto</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione uma imagem para tornar seu produto mais atrativo no menu
        </p>
      </div>
      
      <FileUploader 
        onUploadComplete={onUploadComplete}
        currentImageUrl={currentImageUrl}
      />
      
      {currentImageUrl && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Como aparecerá no menu público</Label>
          <div className="p-4 border rounded-lg bg-muted/20">
            <div className="max-w-xs mx-auto">
              <img
                src={currentImageUrl}
                alt="Preview do produto no menu"
                className="w-full h-32 object-cover rounded-md border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <p className="text-xs text-muted-foreground text-center mt-2">
                Preview de como aparecerá no menu público
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesTab;
