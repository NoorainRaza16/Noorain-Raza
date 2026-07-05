import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, X, Image, FileText, Check } from "lucide-react";

interface FileUploadProps {
  label: string;
  accept: string;
  onFileSelect: (file: File) => void;
  onUrlChange?: (url: string) => void;
  currentUrl?: string;
  placeholder?: string;
  icon?: "image" | "file";
  maxSize?: number; // in MB
  uploadType?: string; // Custom upload type for different endpoints
}

export function FileUpload({
  label,
  accept,
  onFileSelect,
  onUrlChange,
  currentUrl = "",
  placeholder = "Enter URL or upload file",
  icon = "file",
  maxSize = 10,
  uploadType
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Use currentUrl directly instead of internal state
  console.log('FileUpload render - currentUrl:', currentUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select a file smaller than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);
      
      const finalUploadType = uploadType || (icon === 'image' ? 'image' : 'resume');
      const response = await fetch(`/api/admin/upload/${finalUploadType}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        const uploadedUrl = result.data.url;
        console.log('Upload successful, new URL:', uploadedUrl);
        
        setUploadedFileName(file.name);
        
        // Notify parent component to update its state
        console.log('Calling onUrlChange with:', uploadedUrl);
        onUrlChange?.(uploadedUrl);
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully`,
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
      
      onFileSelect(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (newUrl: string) => {
    onUrlChange?.(newUrl);
    setUploadedFileName("");
  };

  const clearFile = () => {
    setUploadedFileName("");
    onUrlChange?.("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const IconComponent = icon === "image" ? Image : FileText;

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <IconComponent className="h-4 w-4" />
        {label}
      </Label>
      
      {/* URL Input */}
      <div className="space-y-2">
        <Input
          placeholder={placeholder}
          value={currentUrl || ""}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
        
        {/* Upload Option */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">or</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
          
          {currentUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File Preview */}
      {currentUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {icon === "image" && currentUrl.startsWith("data:image") ? (
                <div className="relative">
                  <img
                    src={currentUrl}
                    alt="Preview"
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              ) : (
                <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                  <IconComponent className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadedFileName || "External URL"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {uploadedFileName ? `${(currentUrl.length / 1024).toFixed(1)}KB` : currentUrl}
                </p>
              </div>
              
              {uploadedFileName && (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-xs">Uploaded</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <p className="text-xs text-muted-foreground">
        Max file size: {maxSize}MB. Supported formats: {accept.split(',').join(', ')}
      </p>
    </div>
  );
}