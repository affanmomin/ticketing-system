import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserAvatar } from './UserAvatar';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  openTickets: number;
  closedTickets: number;
  members: Array<{
    name: string;
    avatarUrl?: string | null;
    role?: 'admin' | 'employee' | 'client';
  }>;
  onClick?: () => void;
  className?: string;
}

export function ProjectCard({
  name,
  description,
  color,
  openTickets,
  closedTickets,
  members,
  onClick,
  className,
}: ProjectCardProps) {
  const totalTickets = openTickets + closedTickets;
  const progress = totalTickets > 0 ? (closedTickets / totalTickets) * 100 : 0;

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer hover:bg-accent/50 transition-all duration-200',
        'border-border bg-card group',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: color }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-green-400 font-medium">{closedTickets}</span>
            <span>/</span>
            <span>{totalTickets}</span>
            <span>tickets</span>
          </div>

          <div className="flex items-center -space-x-2">
            {members.slice(0, 3).map((member, idx) => (
              <UserAvatar
                key={idx}
                name={member.name}
                avatarUrl={member.avatarUrl}
                role={member.role}
                size="sm"
                className="ring-2 ring-background"
              />
            ))}
            {members.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                +{members.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
