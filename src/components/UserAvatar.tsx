import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  role?: 'admin' | 'employee' | 'client';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

const roleColors = {
  admin: 'bg-purple-500/20 text-purple-300',
  employee: 'bg-blue-500/20 text-blue-300',
  client: 'bg-green-500/20 text-green-300',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserAvatar({
  name,
  avatarUrl,
  role,
  size = 'md',
  className,
  showTooltip = true,
}: UserAvatarProps) {
  const avatar = (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback className={role ? roleColors[role] : 'bg-gray-500/20 text-gray-300'}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );

  if (!showTooltip) {
    return avatar;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{avatar}</TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{name}</p>
          {role && <p className="text-xs text-muted-foreground capitalize">{role}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
