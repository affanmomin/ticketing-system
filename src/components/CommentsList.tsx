import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import * as commentsApi from "@/api/comments";
import * as usersApi from "@/api/users";
import type { AuthUser, Comment } from "@/types/api";
import { formatDistanceToNow } from "date-fns";

type CommentsListProps = {
  ticketId?: string;
  refreshTrigger?: number;
};

type CommentWithAuthor = Comment & {
  author?: AuthUser;
};

export function CommentsList({ ticketId, refreshTrigger = 0 }: CommentsListProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await usersApi.list({ limit: 200, offset: 0 });
        setUsers(data.data);
      } catch (error) {
        console.warn("Failed to load users", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ticketId) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await commentsApi.listByTicket(ticketId);
        if (!mounted) return;
        setComments(data);
      } catch (error) {
        console.warn("Failed to load comments", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [ticketId, refreshTrigger]);

  const userMap = useMemo(() => {
    const map = new Map<string, AuthUser>();
    users.forEach((user) => map.set(user.id, user));
    return map;
  }, [users]);

  if (!ticketId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Save the ticket before starting a conversation.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No comments yet</p>
        <p className="text-xs text-muted-foreground">Be the first to share an update with the team.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const author = userMap.get(comment.authorId);
        const roleLabel = author?.role
          ? author.role.charAt(0) + author.role.slice(1).toLowerCase()
          : undefined;
        const relativeTime = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

        return (
          <Card key={comment.id} className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {author?.fullName || author?.email || comment.authorId}
                </span>
                {roleLabel && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {roleLabel}
                  </Badge>
                )}
                <Badge variant={comment.visibility === "INTERNAL" ? "outline" : "default"} className="text-xs">
                  {comment.visibility === "INTERNAL" ? "Internal" : "Public"}
                </Badge>
                <span className="text-xs text-muted-foreground">{relativeTime}</span>
              </div>
              <div className="whitespace-pre-wrap text-sm text-foreground/90">
                {comment.bodyMd}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default CommentsList;
