import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import * as commentsApi from "@/api/comments";
import * as usersApi from "@/api/users";
import type { Comment } from "@/types/api";
import { MessageSquare } from "lucide-react";

interface CommentsListProps {
  ticketId?: string;
  refreshTrigger?: number;
}

interface CommentWithAuthor extends Comment {
  authorName?: string;
  authorRole?: "admin" | "employee" | "client";
}

export function CommentsList({
  ticketId,
  refreshTrigger = 0,
}: CommentsListProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticketId) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await commentsApi.listByTicket(ticketId);
        if (!mounted) return;

        // Fetch author details for each comment
        const authorIds = [...new Set(data.map((c) => c.authorId))];
        const authorsMap = new Map<string, { name: string; role: string }>();

        await Promise.all(
          authorIds.map(async (authorId) => {
            try {
              const { data: users } = await usersApi.list({
                limit: 1,
                offset: 0,
              });
              const user = users.data.find((u) => u.id === authorId);
              if (user) {
                authorsMap.set(authorId, {
                  name: user.name,
                  role: user.userType.toLowerCase(),
                });
              }
            } catch (e) {
              console.error("Failed to fetch author:", e);
            }
          })
        );

        const enriched = data.map((c) => ({
          ...c,
          authorName: authorsMap.get(c.authorId)?.name || "Unknown User",
          authorRole: authorsMap.get(c.authorId)?.role as any,
        }));

        setComments(enriched);
      } catch (e) {
        console.error("Failed to load comments:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [ticketId, refreshTrigger]);

  if (!ticketId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">
          Save the ticket first to start a conversation
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
        <MessageSquare className="w-12 h-12 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground mb-1">
          No comments yet
        </p>
        <p className="text-xs text-muted-foreground">
          Be the first to share your thoughts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <Card
          key={comment.id}
          className="p-4 bg-card hover:bg-accent/5 transition-colors"
        >
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <UserAvatar
                name={comment.authorName || "Unknown"}
                role={comment.authorRole}
                size="md"
                showTooltip={false}
              />
            </div>

            {/* Comment Content */}
            <div className="flex-1 min-w-0">
              {/* Header: Author & Timestamp */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-semibold text-sm text-foreground">
                  {comment.authorName || "Unknown User"}
                </span>
                {comment.authorRole && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground capitalize">
                    {comment.authorRole}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(comment.createdAt)}
                </span>
              </div>

              {/* Comment Body */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div
                  className="text-sm text-foreground/90 whitespace-pre-wrap break-words"
                  style={{ wordBreak: "break-word" }}
                >
                  {comment.bodyMd}
                </div>
              </div>
            </div>
          </div>

          {/* Separator between comments (except last) */}
          {index < comments.length - 1 && (
            <div className="mt-4 border-b border-border/50" />
          )}
        </Card>
      ))}
    </div>
  );
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default CommentsList;
