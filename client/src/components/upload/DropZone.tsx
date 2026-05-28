/**
 * Drag-and-drop upload zone using react-dropzone.
 * Accepts PDFs and images (JPEG, PNG, WebP) up to 10MB.
 * Shows a preview list of selected files before the user confirms upload.
 */

import { useCallback, useState } from "react";

import { useDropzone, type FileRejection } from "react-dropzone";

import { FileText, Image, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface DropZoneProps {
  onFilesAccepted: (files: File[]) => void;
  isUploading?: boolean;
  maxFiles?: number;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const DropZone = ({
  onFilesAccepted,
  isUploading = false,
  maxFiles = 5,
}: DropZoneProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      // Handle rejected files with helpful messages
      rejected.forEach(({ file, errors }) => {
        errors.forEach((err) => {
          if (err.code === "file-too-large") {
            toast.error(`${file.name} is too large. Max size is 10MB.`);
          } else if (err.code === "file-invalid-type") {
            toast.error(
              `${file.name} is not a supported type. Use PDF, JPEG, PNG, or WebP.`,
            );
          } else {
            toast.error(`${file.name}: ${err.message}`);
          }
        });
      });

      if (accepted.length > 0) {
        setSelectedFiles((prev) => {
          const combined = [...prev, ...accepted];
          if (combined.length > maxFiles) {
            toast.warning(`Maximum ${maxFiles} files allowed.`);
            return combined.slice(0, maxFiles);
          }
          return combined;
        });
      }
    },
    [maxFiles],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_TYPES,
      maxSize: MAX_SIZE,
      maxFiles,
      disabled: isUploading,
      multiple: true,
    });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    onFilesAccepted(selectedFiles);
  };

  const getFileIcon = (file: File) => {
    return file.type === "application/pdf" ? (
      <FileText className="h-4 w-4 text-red-500" />
    ) : (
      <Image className="h-4 w-4 text-blue-500" />
    );
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className=" space-y-4">
      {/* Drop zone content */}

      <div
        {...getRootProps()}
        className={cn(
          " border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer",
          "hover:border-primary hover:bg-primary/5",
          isDragActive && !isDragReject && "border-primary bg-primary/10",
          isDragReject &&
            "border-destructive bg-destructive/5 cursor-not-allowed",
          isUploading && "opacity-50 cursor-not-allowed pointer-events-none",
        )}
      >
        <input {...getInputProps()} />

        <div className=" flex flex-col items-center gap-3">
          <div
            className={cn(
              "p-4 rounded-full",
              isDragReject ? "bg-destructive/10" : "bg-muted",
            )}
          >
            <Upload
              className={cn(
                "h-8 w-8",
                isDragActive && !isDragReject
                  ? "text-primary"
                  : "text-muted-foreground",
                isDragReject && "text-destructive",
              )}
            />
          </div>

          {isDragActive && !isDragReject ? (
            <p className="text-primary font-medium">Drop your files here</p>
          ) : isDragReject ? (
            <p className="text-destructive font-medium">
              Unsupported file type
            </p>
          ) : (
            <>
              <div>
                <p className="font-medium text-foreground">
                  Drop files here or{" "}
                  <span className="text-primary">browse</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, JPEG, PNG, WebP — up to 10MB each (max {maxFiles} files)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* File preview List */}
      {selectedFiles.length > 0 && (
        <div className=" space-y-2">
          <p className=" text-sm font-medium text-muted-foreground">
            {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}{" "}
            selected
          </p>

          <div className=" space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
              >
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className=" flex gap-2 pt-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
              className="flex-1"
            >
              {isUploading
                ? "Uploading..."
                : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}`}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedFiles([])}
              disabled={isUploading}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;
