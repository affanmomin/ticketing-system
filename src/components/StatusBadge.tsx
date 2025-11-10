import React from 'react';
import { cn } from '@/lib/utils';

type Status = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';

const statusConfig: Record<Status, { label: string; className: string }> = {
  backlog: {
    label: 'Backlog',
    className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
  todo: {
    label: 'To Do',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  review: {
    label: 'Review',
    className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  done: {
    label: 'Done',
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
