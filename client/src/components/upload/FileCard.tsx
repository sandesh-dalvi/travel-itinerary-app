import type { TravelDocument } from "@/types";
import { Badge } from "../ui/badge";
import {
  CheckCircle2,
  // ExternalLink,
  FileText,
  Image,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface FileCardProps {
  document: TravelDocument;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

// Displays a single file with its status and allows deletion.
const FileCard = ({ document, onDelete, isDeleting }: FileCardProps) => {
  const statusConfig = {
    processing: {
      icon: <Loader2 className="h-4 w-4 animate-spin text-amber-500" />,
      badge: (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
          Processing
        </Badge>
      ),
    },
    done: {
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      badge: (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          Ready
        </Badge>
      ),
    },
    failed: {
      icon: <XCircle className="h-4 w-4 text-destructive" />,
      badge: <Badge variant="destructive">Failed</Badge>,
    },
  } as const;

  const { icon, badge } = statusConfig[document.status];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border bg-card transition-opacity",
        isDeleting && "opacity-50 pointer-events-none",
      )}
    >
      {/* File type icon */}
      <div className="mt-0.5 shrink-0">
        {document.fileType === "pdf" ? (
          <FileText className="h-8 w-8 text-red-500" />
        ) : (
          <Image className="h-8 w-8 text-blue-500" />
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate">{document.fileName}</p>
          {badge}
        </div>

        {/* Extracted booking type */}
        {document.parsedBookingData && (
          <p className="text-xs text-muted-foreground capitalize">
            {document.parsedBookingData.type} booking
            {document.parsedBookingData.from &&
              document.parsedBookingData.to &&
              ` · ${document.parsedBookingData.from} → ${document.parsedBookingData.to}`}
          </p>
        )}

        {/* Error message */}
        {document.status === "failed" && document.errorMessage && (
          <p className="text-xs text-destructive">{document.errorMessage}</p>
        )}

        <p className="text-xs text-muted-foreground">
          {new Date(document.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {icon}
        {/* <a
          href={document.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Open file"
        >
          <ExternalLink className="h-4 w-4" />
        </a> */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(document._id)}
          disabled={isDeleting}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Delete document"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FileCard;
