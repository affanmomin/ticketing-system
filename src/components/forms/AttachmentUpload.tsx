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
        const { data: presign } = await attachmentsApi.presignUpload(ticketId, {
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
        });

        await axios.put(presign.uploadUrl, file, {
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });

        const { data: stored } = await attachmentsApi.confirmUpload(ticketId, {
          storageUrl: presign.key,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
        });

        setAttachments((prev) => [...prev, stored as AttachmentRecord]);
      }
      setPickedFiles([]);
      toast({ title: "Attachment uploaded" });
    } catch (error: any) {
      toast({
        title: "Failed to upload",
        description: error?.response?.data?.message || "Unexpected error",
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
        <div className="mt-3 flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={!ticketId || pickedFiles.length === 0 || uploading}
          >
            {uploading ? "Uploading…" : "Upload"}
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
                {attachment.storageUrl.startsWith("http") ? (
                  <a
                    href={attachment.storageUrl}
                    className="text-xs text-primary hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Uploaded
                  </span>
                )}
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
