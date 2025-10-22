import { cn } from '@/lib/utils';

interface TagBadgeProps {
  name: string;
  color?: string;
  className?: string;
  onRemove?: () => void;
}

export function TagBadge({ name, color = '#9CA3AF', className, onRemove }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`,
        borderWidth: '1px',
      }}
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity"
          type="button"
        >
          ×
        </button>
      )}
    </span>
  );
}
