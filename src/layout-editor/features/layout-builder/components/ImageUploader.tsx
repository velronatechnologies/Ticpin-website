import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRef } from "react";

interface Props {
  onUpload: (dataUrl: string) => void;
}

export function ImageUploader({ onUpload }: Props) {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onUpload(String(reader.result));
          reader.readAsDataURL(file);
        }}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>
        <Upload className="mr-2 h-4 w-4" /> Upload image
      </Button>
    </div>
  );
}
