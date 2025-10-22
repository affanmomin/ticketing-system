import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Tag,
  Users,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "./UserAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: Array<"admin" | "employee" | "client">;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: <FolderKanban className="w-5 h-5" />,
  },
  {
    title: "Tickets",
    href: "/tickets",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    title: "Tags",
    href: "/tags",
    icon: <Tag className="w-5 h-5" />,
    roles: ["admin", "employee"],
  },
  {
    title: "Clients",
    href: "/clients",
    icon: <Building2 className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    title: "Users",
    href: "/users",
    icon: <Users className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export function Sidebar({
  collapsed = false,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const location = useLocation();
  const { profile } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return profile?.role && item.roles.includes(profile.role);
  });

  const asideWidth = collapsed ? "w-16" : "w-64";

  return (
    <aside
      className={cn(
        asideWidth,
        "bg-card border-r border-border flex flex-col h-screen shrink-0"
      )}
      aria-label="Sidebar"
    >
      <div className={cn("border-b border-border", collapsed ? "p-3" : "p-4")}>
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center gap-0" : "justify-between gap-2"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Ticketly
                </h1>
                <p className="text-xs text-muted-foreground">
                  Project Management
                </p>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggle}
            className="hidden md:inline-flex"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      <nav
        className={cn(
          "flex-1 space-y-1 overflow-y-auto",
          collapsed ? "p-2" : "p-3"
        )}
      >
        <TooltipProvider>
          {filteredNavItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(item.href + "/");

            return (
              <Tooltip key={item.href} disableHoverableContent={!collapsed}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                      collapsed ? "px-2 py-2 justify-center" : "px-3 py-2",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <span className="text-muted-foreground group-hover:text-foreground">
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.title}</span>}
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-primary" />
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" align="center">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
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
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile.role}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
