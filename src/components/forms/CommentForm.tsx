import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as commentsApi from "@/api/comments";
import * as attachmentsApi from "@/api/attachments";
import { toast } from "@/hooks/use-toast";

export function CommentForm({
  ticketId,
  onPosted,
}: {
  ticketId?: string;
  onPosted?: () => void;
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  // file preview not used in static UI

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketId || !text.trim()) return;
    setSaving(true);
    try {
      await commentsApi.create({ ticketId, bodyMd: text });
      if (file) {
        await attachmentsApi.upload({ file, ticketId });
      }
      setText("");
      setFile(null);
      onPosted?.();
    } catch (e: any) {
      toast({
        title: "Failed to add comment",
        description: e?.response?.data?.message || "Error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex items-start gap-3" onSubmit={handleSubmit}>
      <div className="flex-1">
        <Label>
          Comment{" "}
          <span aria-hidden className="text-red-400">
            *
          </span>
        </Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-required="true"
        />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button type="submit" disabled={!ticketId || !text.trim() || saving}>
          {saving ? "Posting…" : "Add comment"}
        </Button>
      </div>
    </form>
  );
}

export default CommentForm;
