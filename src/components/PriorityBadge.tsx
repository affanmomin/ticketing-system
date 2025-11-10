import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowDown, ArrowUp, Circle } from 'lucide-react';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

const priorityConfig: Record<Priority, { label: string; icon: React.ReactNode; className: string }> = {
  low: {
    label: 'Low',
    icon: <ArrowDown className="w-3 h-3" />,
    className: 'text-gray-400',
  },
  medium: {
    label: 'Medium',
    icon: <Circle className="w-3 h-3" />,
    className: 'text-blue-400',
  },
  high: {
    label: 'High',
    icon: <ArrowUp className="w-3 h-3" />,
    className: 'text-orange-400',
  },
  urgent: {
    label: 'Urgent',
    icon: <AlertCircle className="w-3 h-3" />,
    className: 'text-red-400',
  },
};

interface PriorityBadgeProps {
  priority: Priority;
  showLabel?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showLabel = false, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <div className={cn('inline-flex items-center gap-1', config.className, className)}>
      {config.icon}
      {showLabel && <span className="text-xs font-medium">{config.label}</span>}
    </div>
  );
}
