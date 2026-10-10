import { useRef, useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateImageFile } from "@/lib/storage";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  onFileSelected: (file: File) => Promise<string>;
  onRemoveImage?: (url: string) => Promise<void>;
}

export function ImageUploader({
  value,
  onChange,
  maxImages = 5,
  onFileSelected,
  onRemoveImage,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const remaining = maxImages - value.length;
  const canUpload = remaining > 0;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) return;

    for (const file of toUpload) {
      const err = validateImageFile(file);
      if (err) {
        alert(err);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
    }

    setIsUploading(true);
    setUploadingCount(toUpload.length);

    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const url = await onFileSelected(file);
        urls.push(url);
      }
      onChange([...value, ...urls]);
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadingCount(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (url: string) => {
    if (!confirm("Remove this image?")) return;
    try {
      if (onRemoveImage) await onRemoveImage(url);
      onChange(value.filter((u) => u !== url));
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? "Could not remove image");
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {value.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-canvas-200 bg-canvas-100"
            >
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-navy-900 shadow-sm">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {canUpload && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={remaining > 1}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="w-full gap-2 border-dashed border-2 border-canvas-300 py-6 hover:border-gold-400 hover:bg-gold-100/30"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading {uploadingCount} image
                {uploadingCount === 1 ? "" : "s"}...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Add {remaining === maxImages ? "Images" : "More Images"} (
                {value.length}/{maxImages})
              </>
            )}
          </Button>
        </div>
      )}

      {/* Helper text */}
      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <ImageIcon className="mt-0.5 h-3 w-3 shrink-0 text-navy-400" />
        <span>
          JPG, PNG or WEBP. Max 5MB each. Up to {maxImages} images. The{" "}
          <strong className="font-semibold text-navy-700">first image</strong>{" "}
          will be the cover.
        </span>
      </div>
    </div>
  );
}