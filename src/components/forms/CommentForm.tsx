import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Paperclip, Send } from "lucide-react";
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
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
      setFormState({ text: "", file: null, saving: false });
      onPosted?.();
    } catch (e: any) {
      toast({
        title: "Failed to post comment",
        description: e?.response?.data?.message || "Error",
        variant: "destructive",
      });
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="p-0 overflow-hidden border-2 focus-within:border-primary/50 transition-colors">
      <div className="flex flex-col">
        {/* Text Area */}
        <Textarea
          placeholder="Write a comment... (Cmd/Ctrl + Enter to submit)"
          value={formState.text}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, text: e.target.value }))
          }
          onKeyDown={handleKeyDown}
          disabled={!ticketId || formState.saving}
          className="min-h-[100px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-b-none"
        />

        {/* Footer with Actions */}
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-muted/30 border-t">
          <div className="flex items-center gap-2">
            {/* File Attachment Button */}
            <label
              htmlFor="comment-file"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                formState.file
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              } ${!ticketId || formState.saving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              {formState.file ? formState.file.name : "Attach file"}
            </label>
            <input
              id="comment-file"
              type="file"
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  file: e.target.files?.[0] || null,
                }))
              }
              disabled={!ticketId || formState.saving}
              className="sr-only"
            />
            {formState.file && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFormState((prev) => ({ ...prev, file: null }))
                }
                className="h-7 px-2 text-xs"
              >
                Remove
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground hidden sm:block">
              Markdown supported
            </p>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!ticketId || !formState.text.trim() || formState.saving}
              size="sm"
              className="gap-1.5"
            >
              {formState.saving ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Posting
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Comment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default CommentForm;
