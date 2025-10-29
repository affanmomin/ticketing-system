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
    <div className="space-y-4">
      {/* Comment Text Area */}
      <div className="space-y-2">
        <Label htmlFor="comment-text" className="text-sm font-medium">
          Add Comment
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Textarea
          id="comment-text"
          placeholder="Write your comment here..."
          value={formState.text}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, text: e.target.value }))
          }
          aria-required="true"
          className="min-h-[100px] resize-y"
        />
      </div>

      {/* File Attachment & Submit Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <Label htmlFor="comment-file" className="text-sm font-medium sr-only">
            Attach File
          </Label>
          <Input
            id="comment-file"
            type="file"
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                file: e.target.files?.[0] || null,
              }))
            }
            className="h-10"
          />
          {formState.file && (
            <p className="text-xs text-muted-foreground mt-1">
              {formState.file.name}
            </p>
          )}
        </div>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!ticketId || !formState.text.trim() || formState.saving}
          className="min-w-[120px]"
        >
          {formState.saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Posting
            </span>
          ) : (
            "Add Comment"
          )}
        </Button>
      </div>
    </div>
  );
}

export default CommentForm;
