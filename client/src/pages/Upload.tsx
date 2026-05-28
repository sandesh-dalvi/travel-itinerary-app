import { useState, useTransition } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import type { TravelDocument } from "@/types";
import { documentApi } from "@/api/document.api";

import { toast } from "sonner";
import { ArrowRight, Sparkles } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import DropZone from "@/components/upload/DropZone";
import FileCard from "@/components/upload/FileCard";

const Upload = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // state without blocking the upload
  const [isNavigating, startTransition] = useTransition();

  // fetch existing document
  const { data: documentsData, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["documents"],
    queryFn: () => documentApi.getAll(),
    select: (res) => res.data,
  });

  const documents = documentsData?.documents ?? [];
  const readyDocuments = documents.filter((doc) => doc.status === "done");

  // Upload mutation  runs sequentially for each file to avoid overwhelming the server
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const results: TravelDocument[] = [];

      for (const file of files) {
        const res = await documentApi.upload(file);
        if (res.data?.document) {
          results.push(res.data.document);
        }
      }
      return results;
    },

    onSuccess: (newDocs) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      const successCount = newDocs.filter(
        (doc) => doc.status === "done",
      ).length;
      const failCount = newDocs.filter((doc) => doc.status === "failed").length;

      if (successCount > 0) {
        toast.success(
          `${successCount} document${successCount > 1 ? "s" : ""} uploaded and processed successfully.`,
        );
      }
      if (failCount > 0) {
        toast.error(
          `${failCount} document${failCount > 1 ? "s" : ""} failed to process. You can still try generating an itinerary with the successful ones.`,
        );
      }
    },

    onError: () => {
      toast.error("Failed to upload documents. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: documentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted successfully.");
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Failed to delete document.");
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const handleGenerate = () => {
    // useTransition keeps the current page interactive while React prepares the navigation
    startTransition(() => {
      const ids = readyDocuments.map((d) => d._id).join(",");
      navigate(`/generate?documentIds=${ids}`);
    });
  };

  return (
    <section className=" max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="">
        <h1 className=" text-2xl font-semibold">Upload booking documents</h1>
        <p className="text-muted-foreground mt-1">
          Add your flight tickets, hotel bookings, or any travel confirmations.
          Our AI will extract the details automatically.
        </p>
      </div>

      {/* DropZone */}
      <DropZone
        onFilesAccepted={(files) => uploadMutation.mutate(files)}
        isUploading={uploadMutation.isPending}
        maxFiles={5}
      />

      {/* Uploaded documents list */}
      {(isLoadingDocuments || documents.length > 0) && (
        <>
          <Separator />
          <div className=" space-y-4">
            <div className=" flex items-center justify-between">
              <h2 className=" text-lg font-medium">Your Documents</h2>
              {readyDocuments.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {readyDocuments.length} ready for generation
                </span>
              )}
            </div>

            {isLoadingDocuments ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <FileCard
                    key={doc._id}
                    document={doc}
                    onDelete={handleDelete}
                    isDeleting={deletingId === doc._id}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Generate CTA — only shown when at least one document is ready */}
      {readyDocuments.length > 0 && (
        <div className="sticky bottom-6 flex justify-end">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={isNavigating}
            className="shadow-lg gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate itinerary
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
};

export default Upload;
