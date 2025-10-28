import { useEffect, useState } from "react";
import * as attachmentsApi from "@/api/attachments";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function AttachmentUpload({ ticketId }: { ticketId?: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [serverFiles, setServerFiles] = useState<
    Array<{ id: string; filename: string; size: number; url?: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticketId) return;
    (async () => {
      const { data } = await attachmentsApi.listByTicket(ticketId);
      setServerFiles(
        data.map((a) => ({
          id: a.id,
          filename: a.filename,
          size: a.size,
          url: a.url,
        }))
      );
    })();
  }, [ticketId]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const uploadAll = async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      for (const f of files) {
        const { data } = await attachmentsApi.upload({ file: f, ticketId });
        setServerFiles((s) => [
          ...s,
          {
            id: data.id,
            filename: data.filename,
            size: data.size,
            url: data.url,
          },
        ]);
      }
      setFiles([]);
      toast({
        title: "Uploaded",
        description: "Attachments uploaded successfully.",
      });
    } catch (e: any) {
      toast({
        title: "Upload failed",
        description: e?.response?.data?.message || "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    await attachmentsApi.remove(id);
    setServerFiles((s) => s.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-border rounded p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Drag & drop files here, or click to browse
        </p>
        <input type="file" multiple className="mt-2" onChange={onChange} />
        <div className="mt-2 text-right">
          <Button
            disabled={!ticketId || files.length === 0 || loading}
            onClick={uploadAll}
          >
            {loading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium">Files</h4>
        <div className="space-y-2 mt-2">
          {serverFiles.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between text-sm text-muted-foreground"
            >
              <div>
                {f.url ? (
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {f.filename}
                  </a>
                ) : (
                  f.filename
                )}
              </div>
              <div>
                {Math.round(f.size / 1024)} KB
                <button
                  className="ml-2 text-red-400"
                  onClick={() => remove(f.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {serverFiles.length === 0 && (
            <div className="text-sm text-muted-foreground">No attachments.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttachmentUpload;
