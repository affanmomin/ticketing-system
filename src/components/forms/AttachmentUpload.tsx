import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import * as attachmentsApi from "@/api/attachments";
import type { Attachment } from "@/types/api";

type AttachmentUploadProps = {
  ticketId?: string;
};

export function AttachmentUpload({ ticketId }: AttachmentUploadProps) {
  const [pickedFiles, setPickedFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string>("");

  useEffect(() => {
    if (!ticketId) return;
    (async () => {
      try {
        const { data } = await attachmentsApi.listByTicket(ticketId);
        setAttachments(data);
      } catch (error) {
        console.warn("Failed to load attachments", error);
      }
    })();
  }, [ticketId]);

  async function handleUpload() {
    if (!ticketId || pickedFiles.length === 0) return;
    setUploading(true);
    const fileCount = pickedFiles.length;
    try {
      for (const file of pickedFiles) {
        setUploadingFileName(file.name);
        console.log("📤 Starting upload for:", file.name, {
          size: file.size,
          type: file.type,
        });

        // Direct upload to backend
        const { data: attachment } = await attachmentsApi.upload(
          ticketId,
          file
        );
        console.log("✅ Upload successful:", attachment);

        setAttachments((prev) => [...prev, attachment]);
      }
      setPickedFiles([]);
      setUploadingFileName("");
      toast({
        title: "Attachment uploaded",
        description: `${fileCount} file(s) uploaded successfully`,
      });
    } catch (error: any) {
      console.error("❌ Upload failed:", error);
      setUploadingFileName("");

      let errorMessage = "Unexpected error. Check console for details.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Failed to upload",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(attachment: Attachment) {
    try {
      console.log("Starting download for attachment:", attachment.id);
      const response = await attachmentsApi.download(attachment.id);
      
      console.log("Download response:", {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        dataType: typeof response.data,
        isBlob: response.data instanceof Blob,
      });
      
      // Response data is already a Blob when responseType is "blob"
      const blob = response.data;
      
      if (!(blob instanceof Blob)) {
        console.error("Response data is not a Blob:", blob);
        throw new Error("Invalid response format - expected Blob");
      }
      
      console.log("Blob details:", {
        size: blob.size,
        type: blob.type,
      });
      
      // Create download link with properly encoded filename
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Encode filename to handle special characters
      link.download = attachment.fileName;
      link.setAttribute("download", attachment.fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
      
      toast({
        title: "Download started",
        description: `Downloading ${attachment.fileName}`,
      });
    } catch (error: any) {
      console.error("Download failed:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        isBlob: error?.response?.data instanceof Blob,
      });
      
      let errorMessage = "Failed to download attachment";
      let isErrorBlob = false;
      
      // Handle blob error responses - sometimes server returns blob even on error
      if (error?.response?.data instanceof Blob) {
        const blobData = error.response.data;
        
        // Try to determine if blob is error JSON or actual file data
        // Error JSONs are usually small and start with '{'
        if (blobData.size < 5000) {
          try {
            // Create a copy to read without consuming the original
            const text = await blobData.text();
            console.log("Blob text preview:", text.substring(0, 200));
            
            // Check if it looks like JSON error (must start with { and contain error fields)
            const trimmedText = text.trim();
            if (trimmedText.startsWith('{') && 
                (trimmedText.includes('"statusCode"') || trimmedText.includes('"error"') || trimmedText.includes('"message"'))) {
              try {
                const errorData = JSON.parse(text);
                isErrorBlob = true;
                
                // Check if it's the Content-Disposition header error
                if (errorData.message?.includes("content-disposition") || 
                    errorData.message?.includes("Invalid character")) {
                  errorMessage = "Server error: Invalid filename encoding. The filename contains invalid characters that cannot be used in HTTP headers. Please contact support or rename the file.";
                } else {
                  errorMessage = errorData.message || errorMessage;
                }
                console.log("Detected error JSON blob, will not attempt download");
              } catch (jsonParseError) {
                // If it looks like JSON but can't parse, might still be an error
                isErrorBlob = true;
                errorMessage = `Server error (${error?.response?.status || 500})`;
              }
            } else {
              // Not JSON, might be actual file data
              console.log("Blob doesn't appear to be error JSON, might be file data");
            }
          } catch (parseError) {
            console.error("Could not read blob as text:", parseError);
            // If we can't read it as text, it's probably binary file data
            // Only mark as error if it's very small
            if (blobData.size < 500) {
              isErrorBlob = true;
              errorMessage = `Server error (${error?.response?.status || 500})`;
            }
          }
        } else {
          // Large blob - likely actual file data, but server returned error status
          // This shouldn't happen, but handle it gracefully
          console.log("Large blob detected, but server returned error status");
        }
        
        // Only try to download if it's NOT an error blob and has reasonable size
        if (!isErrorBlob && blobData.size > 100) {
          try {
            console.log("Attempting to download blob despite error status");
            const url = window.URL.createObjectURL(blobData);
            const link = document.createElement("a");
            link.href = url;
            link.download = attachment.fileName;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
              document.body.removeChild(link);
            }, 100);
            
            toast({
              title: "Download started",
              description: `Downloading ${attachment.fileName} (server returned error but file data received)`,
            });
            return;
          } catch (downloadError) {
            console.error("Failed to download blob:", downloadError);
          }
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status) {
        errorMessage = `Server error (${error.response.status})`;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Failed to download attachment",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  async function handleRemove(id: string) {
    try {
      await attachmentsApi.remove(id);
      setAttachments((prev) =>
        prev.filter((attachment) => attachment.id !== id)
      );
      toast({ title: "Attachment removed" });
    } catch (error: any) {
      toast({
        title: "Failed to remove attachment",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Drag & drop files or browse to attach supporting material.
        </p>
        <input
          type="file"
          multiple
          className="mt-3"
          onChange={(event) => {
            const files = event.target.files;
            if (!files) return;
            setPickedFiles(Array.from(files));
          }}
          disabled={!ticketId || uploading}
        />
        {pickedFiles.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Selected files:
            </p>
            {pickedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span className="truncate">{file.name}</span>
                <span className="ml-2 shrink-0">
                  {Math.round(file.size / 1024)} KB
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={!ticketId || pickedFiles.length === 0 || uploading}
          >
            {uploading
              ? `Uploading ${uploadingFileName}...`
              : `Upload ${pickedFiles.length > 0 ? `(${pickedFiles.length})` : ""}`}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">
          Current attachments
        </h4>
        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attachments yet.</p>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between rounded border bg-muted/40 px-3 py-2 text-sm"
            >
              <div className="flex flex-col">
                <span>{attachment.fileName}</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(attachment.fileSize / 1024)} KB ·{" "}
                  {attachment.mimeType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(attachment)}
                >
                  Download
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemove(attachment.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AttachmentUpload;

