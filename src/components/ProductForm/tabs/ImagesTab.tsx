
import { Label } from "@/components/ui/label";
import FileUploader from "@/components/FileUploader";

interface ImagesTabProps {
  currentImageUrl: string;
  onUploadComplete: (url: string) => void;
}

const ImagesTab = ({ currentImageUrl, onUploadComplete }: ImagesTabProps) => {
  return (
    <div className="space-y-4">
      <Label>Imagem do Produto</Label>
      <FileUploader 
        onUploadComplete={onUploadComplete}
        currentImageUrl={currentImageUrl}
      />
    </div>
  );
};

export default ImagesTab;
