import { useMemo, useState, useEffect, useRef } from "react";
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
import * as usersApi from "@/api/users";
import type { CommentVisibility, AuthUser } from "@/types/api";
import { AtSign } from "lucide-react";

type CommentFormProps = {
  ticketId?: string;
  onPosted?: () => void;
};

export function CommentForm({ ticketId, onPosted }: CommentFormProps) {
  const { user } = useAuthStore();
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<CommentVisibility>("PUBLIC");
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSelectVisibility = useMemo(() => {
    const role = user?.role;
    return role === "ADMIN" || role === "EMPLOYEE";
  }, [user?.role]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await usersApi.list({ limit: 200, offset: 0 });
        setUsers(data.data);
      } catch (error) {
        console.warn("Failed to load users for mentions", error);
      }
    })();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!mentionQuery) return users.slice(0, 5);
    const query = mentionQuery.toLowerCase();
    return users
      .filter(
        (u) =>
          u.fullName?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [users, mentionQuery]);

  const handleTextChange = (value: string) => {
    setBody(value);
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setMentionQuery(textAfterAt);
        setMentionPosition({ start: lastAtIndex, end: cursorPos });
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
    setMentionQuery("");
  };

  const insertMention = (user: AuthUser) => {
    const textBefore = body.substring(0, mentionPosition.start);
    const textAfter = body.substring(mentionPosition.end);
    const mention = `@${user.fullName || user.email || user.id} `;
    const newBody = textBefore + mention + textAfter;
    setBody(newBody);
    setShowMentions(false);
    setMentionQuery("");
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = textBefore.length + mention.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

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
      <div className="flex flex-col relative">
        <Textarea
          ref={textareaRef}
          placeholder="Write a comment... @mention users (Cmd/Ctrl + Enter to submit)"
          value={body}
          onChange={(event) => handleTextChange(event.target.value)}
          onKeyDown={(e) => {
            if (showMentions && e.key === "ArrowDown") {
              e.preventDefault();
              // Could implement keyboard navigation here
            } else if (showMentions && e.key === "Escape") {
              setShowMentions(false);
            } else {
              handleKeyDown(e);
            }
          }}
          disabled={!ticketId || saving}
          className="min-h-[120px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {showMentions && filteredUsers.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-full z-50">
            <Card className="p-2 max-h-48 overflow-y-auto">
              <div className="space-y-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => insertMention(user)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent text-left text-sm transition-colors"
                  >
                    <AtSign className="h-3 w-3 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.fullName || user.email || user.id}
                      </span>
                      {user.fullName && user.email !== user.fullName && (
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

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
