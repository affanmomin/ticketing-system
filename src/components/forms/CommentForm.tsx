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
  const [formState, setFormState] = useState({
    text: "",
    file: null as File | null,
    saving: false,
  });

  async function handleSubmit() {
    if (!ticketId || !formState.text.trim()) return;
    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      await commentsApi.create({ ticketId, bodyMd: formState.text });
      if (formState.file) {
        await attachmentsApi.upload({ file: formState.file, ticketId });
      }
      setFormState({ text: "", file: null, saving: false });
      onPosted?.();
    } catch (e: any) {
      toast({
        title: "Failed to add comment",
        description: e?.response?.data?.message || "Error",
      });
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <Label>
          Comment{" "}
          <span aria-hidden className="text-red-400">
            *
          </span>
        </Label>
        <Textarea
          value={formState.text}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, text: e.target.value }))
          }
          aria-required="true"
        />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Input
          type="file"
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              file: e.target.files?.[0] || null,
            }))
          }
        />
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!ticketId || !formState.text.trim() || formState.saving}
        >
          {formState.saving ? "Posting…" : "Add comment"}
        </Button>
      </div>
    </div>
  );
}

export default CommentForm;
