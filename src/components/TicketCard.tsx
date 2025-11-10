import React from 'react';
import { Card } from '@/components/ui/card';
import { PriorityBadge } from './PriorityBadge';
import { TagBadge } from './TagBadge';
import { UserAvatar } from './UserAvatar';
import { cn } from '@/lib/utils';
import { MessageSquare, Paperclip } from 'lucide-react';

interface TicketCardProps {
  id: string;
  ticketNumber: number;
  title: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    name: string;
    avatarUrl?: string | null;
    role?: 'admin' | 'employee' | 'client';
  } | null;
  tags?: Array<{ name: string; color: string }>;
  commentCount?: number;
  attachmentCount?: number;
  onClick?: () => void;
  className?: string;
}

export function TicketCard({
  ticketNumber,
  title,
  priority,
  assignee,
  tags = [],
  commentCount = 0,
  attachmentCount = 0,
  onClick,
  className,
}: TicketCardProps) {
  return (
    <Card
      className={cn(
        'p-3 cursor-pointer hover:bg-accent/50 transition-all duration-200',
        'border-border bg-card group',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">#{ticketNumber}</span>
          <PriorityBadge priority={priority} />
        </div>
        {assignee && <UserAvatar name={assignee.name} avatarUrl={assignee.avatarUrl} role={assignee.role} size="sm" />}
      </div>

      <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {title}
      </h3>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {tags.slice(0, 2).map((tag, idx) => (
            <TagBadge key={idx} name={tag.name} color={tag.color} />
          ))}
          {tags.length > 2 && (
            <span className="text-xs text-muted-foreground">+{tags.length - 2}</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          {commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs">{commentCount}</span>
            </div>
          )}
          {attachmentCount > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              <span className="text-xs">{attachmentCount}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
