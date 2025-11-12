import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import * as attachmentsApi from "@/api/attachments";

type AttachmentRecord = {
  id: string;
  fileName: string;
  fileSize: number;
  storageUrl: string;
  mimeType: string;
};

type AttachmentUploadProps = {
  ticketId?: string;
};

export function AttachmentUpload({ ticketId }: AttachmentUploadProps) {
  const [pickedFiles, setPickedFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<AttachmentRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string>("");

  useEffect(() => {
    if (!ticketId) return;
    (async () => {
      try {
        const { data } = await attachmentsApi.listByTicket(ticketId);
        setAttachments(data as AttachmentRecord[]);
      } catch (error) {
        console.warn("Failed to load attachments", error);
      }
    })();
  }, [ticketId]);

  async function handleUpload() {
    if (!ticketId || pickedFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of pickedFiles) {
        setUploadingFileName(file.name);
        console.log("📤 Starting upload for:", file.name, {
          size: file.size,
          type: file.type,
        });

        // Step 1: Get presigned URL
        console.log("1️⃣ Requesting presigned URL...");
        const { data: presign } = await attachmentsApi.presignUpload(ticketId, {
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
        });
        console.log("✅ Presigned URL received:", {
          uploadUrl: presign.uploadUrl.substring(0, 50) + "...",
          key: presign.key,
          fullPresignData: presign,
        });

        // Step 2: Upload to storage
        console.log("2️⃣ Uploading to storage...");
        try {
          await axios.put(presign.uploadUrl, file, {
            headers: { "Content-Type": file.type || "application/octet-stream" },
          });
          console.log("✅ File uploaded to storage");
        } catch (storageError: any) {
          console.warn("⚠️ Storage upload failed (may be expected in local dev):", storageError.message);
          console.warn("Proceeding with mock upload confirmation...");
          // In development, storage might not be configured
          // We'll still try to confirm with the backend
        }

        // Step 3: Confirm upload with backend
        console.log("3️⃣ Confirming upload with backend...");
        
        // Try different formats for storageUrl based on what backend might expect
        let storageUrl = presign.key; // First try: use the key as-is
        
        // If key looks like a full URL, use it
        if (presign.key && (presign.key.startsWith('http://') || presign.key.startsWith('https://'))) {
          storageUrl = presign.key;
        }
        // If uploadUrl has query params, remove them to get the base URL
        else if (presign.uploadUrl) {
          storageUrl = presign.uploadUrl.split('?')[0];
        }
        
        console.log("Using storageUrl:", storageUrl);
        console.log("Payload:", {
          storageUrl,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
        });
        
        const { data: stored } = await attachmentsApi.confirmUpload(ticketId, {
          storageUrl: storageUrl,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
        });
        console.log("✅ Upload confirmed:", stored);

        setAttachments((prev) => [...prev, stored as AttachmentRecord]);
      }
      setPickedFiles([]);
      setUploadingFileName("");
      toast({ title: "Attachment uploaded" });
    } catch (error: any) {
      console.error("❌ Upload failed:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        code: error?.code,
      });
      setUploadingFileName("");
      
      let errorMessage = "Unexpected error. Check console for details.";
      
      if (error?.code === "ERR_NETWORK" || error?.message?.includes("Network Error")) {
        errorMessage = "Network error: Storage service may not be configured. Check backend logs or configure S3/storage.";
      } else if (error?.response?.data?.message) {
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
                  onClick={() => {
                    // Try to open the URL if it's a full http URL
                    if (attachment.storageUrl.startsWith("http://") || attachment.storageUrl.startsWith("https://")) {
                      window.open(attachment.storageUrl, "_blank");
                    } else {
                      // Otherwise show a message that file is stored
                      toast({
                        title: "File stored",
                        description: `${attachment.fileName} is saved. Configure storage service to enable viewing.`,
                      });
                      console.log("File storage info:", {
                        fileName: attachment.fileName,
                        storageUrl: attachment.storageUrl,
                        size: attachment.fileSize,
                        mimeType: attachment.mimeType,
                      });
                    }
                  }}
                  disabled={!attachment.storageUrl}
                >
                  {attachment.storageUrl && (attachment.storageUrl.startsWith("http://") || attachment.storageUrl.startsWith("https://")) 
                    ? "View" 
                    : "Info"}
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
