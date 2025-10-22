import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Tag,
  Users,
  Settings,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from './UserAvatar';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: Array<'admin' | 'employee' | 'client'>;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: <FolderKanban className="w-5 h-5" />,
  },
  {
    title: 'Tickets',
    href: '/tickets',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    title: 'Tags',
    href: '/tags',
    icon: <Tag className="w-5 h-5" />,
    roles: ['admin', 'employee'],
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    title: 'Users',
    href: '/users',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

export function Sidebar() {
  const location = useLocation();
  const { profile } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return profile?.role && item.roles.includes(profile.role);
  });

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Ticketly</h1>
            <p className="text-xs text-muted-foreground">Project Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {profile && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserAvatar
              name={profile.full_name}
              avatarUrl={profile.avatar_url}
              role={profile.role}
              showTooltip={false}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
