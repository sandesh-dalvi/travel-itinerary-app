import { useState } from "react";
import { Copy, Check, Globe, Lock, ExternalLink, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShare } from "@/hooks/useShare";
import type { Itinerary } from "@/types";

interface ShareModalProps {
  itinerary: Itinerary;
  isOpen: boolean;
  onClose: () => void;
}

type ExpiresIn = "7d" | "30d" | "never";

const EXPIRY_LABELS: Record<ExpiresIn, string> = {
  "7d": "7 days",
  "30d": "30 days",
  never: "Never expires",
};

export const ShareModal = ({ itinerary, isOpen, onClose }: ShareModalProps) => {
  const [selectedExpiry, setSelectedExpiry] = useState<ExpiresIn>("7d");

  const {
    shareUrl,
    shareExpiresAt,
    isCopied,
    isLoading,
    enableSharing,
    disableSharing,
    copyToClipboard,
  } = useShare(itinerary._id);

  // Derive current public state — use live hook result if sharing was just toggled,
  // otherwise fall back to the itinerary prop from the server
  const isCurrentlyPublic =
    shareUrl !== null
      ? true
      : itinerary.isPublic && Boolean(itinerary.shareToken);

  const currentShareUrl =
    shareUrl ??
    (itinerary.shareToken
      ? `${window.location.origin}/share/${itinerary.shareToken}`
      : null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share itinerary
          </DialogTitle>
          <DialogDescription>
            Anyone with the link can view this itinerary — no account required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Current status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-3">
              {isCurrentlyPublic ? (
                <Globe className="h-5 w-5 text-green-600" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {isCurrentlyPublic ? "Public — link is active" : "Private"}
                </p>
                {isCurrentlyPublic && shareExpiresAt && (
                  <p className="text-xs text-muted-foreground">
                    Expires{" "}
                    {new Date(shareExpiresAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
                {isCurrentlyPublic && !shareExpiresAt && (
                  <p className="text-xs text-muted-foreground">Never expires</p>
                )}
              </div>
            </div>
            <Badge variant={isCurrentlyPublic ? "default" : "secondary"}>
              {isCurrentlyPublic ? "On" : "Off"}
            </Badge>
          </div>

          {/* Enable sharing controls */}
          {!isCurrentlyPublic && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Link expires in</label>
                <Select
                  value={selectedExpiry}
                  onValueChange={(v) => setSelectedExpiry(v as ExpiresIn)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(EXPIRY_LABELS) as [ExpiresIn, string][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={() => enableSharing(selectedExpiry)}
                disabled={isLoading}
              >
                <Globe className="mr-2 h-4 w-4" />
                {isLoading ? "Generating link..." : "Create share link"}
              </Button>
            </div>
          )}

          {/* Active share link — copy + disable controls */}
          {isCurrentlyPublic && currentShareUrl && (
            <div className="space-y-3">
              {/* URL display + copy button */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex-1 min-w-0 px-3 py-2 rounded-md bg-muted border text-xs font-mono break-all leading-relaxed">
                  {currentShareUrl}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={copyToClipboard}
                    aria-label="Copy link"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    asChild
                    aria-label="Open in new tab"
                  >
                    <a
                      href={currentShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Disable sharing */}
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={disableSharing}
                disabled={isLoading}
              >
                <Lock className="mr-2 h-4 w-4" />
                {isLoading ? "Updating..." : "Make private"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
