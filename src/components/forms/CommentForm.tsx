import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/hooks/use-toast";
import * as commentsApi from "@/api/comments";
import type { CommentVisibility } from "@/types/api";

type CommentFormProps = {
  ticketId?: string;
  onPosted?: () => void;
};

export function CommentForm({ ticketId, onPosted }: CommentFormProps) {
  const { user } = useAuthStore();
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<CommentVisibility>("PUBLIC");
  const [saving, setSaving] = useState(false);

  const canSelectVisibility = useMemo(() => {
    const role = user?.role;
    return role === "ADMIN" || role === "EMPLOYEE";
  }, [user?.role]);

  async function handleSubmit() {
    if (!ticketId || !body.trim()) return;
    setSaving(true);
    try {
      await commentsApi.create(ticketId, {
        bodyMd: body.trim(),
        visibility,
      });
      toast({ title: "Comment posted" });
      setBody("");
      setSaving(false);
      onPosted?.();
    } catch (error: any) {
      setSaving(false);
      toast({
        title: "Failed to post comment",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <Card className="overflow-hidden border">
      <div className="flex flex-col">
        <Textarea
          placeholder="Write a comment... (Cmd/Ctrl + Enter to submit)"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!ticketId || saving}
          className="min-h-[120px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <div className="flex flex-col gap-3 border-t bg-muted/40 p-3 md:flex-row md:items-center md:justify-between">
          {canSelectVisibility ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Visibility
              </span>
              <Select
                value={visibility}
                onValueChange={(value: CommentVisibility) =>
                  setVisibility(value)
                }
              >
                <SelectTrigger className="h-8 w-40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Comments are always public for client users.
            </p>
          )}

          <div className="flex items-center gap-2">
            <p className="hidden text-xs text-muted-foreground md:block">
              Markdown supported
            </p>
            <Button
              type="button"
              size="sm"
              disabled={!ticketId || !body.trim() || saving}
              onClick={handleSubmit}
            >
              {saving ? "Posting…" : "Add comment"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default CommentForm;
