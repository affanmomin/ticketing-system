import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Tag,
  Users,
  Settings,
  Building2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { UserAvatar } from "./UserAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Button removed (hover only behavior)

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: Array<"ADMIN" | "EMPLOYEE" | "CLIENT">;
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
    roles: ["ADMIN", "EMPLOYEE"],
  },
  {
    title: "Clients",
    href: "/clients",
    icon: <Building2 className="w-5 h-5" />,
    roles: ["ADMIN"],
  },
  {
    title: "Users",
    href: "/users",
    icon: <Users className="w-5 h-5" />,
    roles: ["ADMIN"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const location = useLocation();
  const { user } = useAuthStore();
  const [hoverOpen, setHoverOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  // Render-time collapsed state: expand on hover when initially collapsed
  const renderCollapsed = collapsed && !hoverOpen;
  const asideWidth = renderCollapsed ? "w-16" : "w-64";

  return (
    <aside
      className={cn(
        asideWidth,
        "relative bg-card border-r border-border flex flex-col h-screen shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out"
      )}
      aria-label="Sidebar"
      onMouseEnter={() => {
        if (collapsed) setHoverOpen(true);
      }}
      onMouseLeave={() => {
        if (collapsed) setHoverOpen(false);
      }}
    >
      <div
        className={cn(
          "border-b border-border",
          renderCollapsed ? "p-3" : "p-4"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            renderCollapsed ? "justify-center gap-0" : "justify-between gap-2"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            {!renderCollapsed && (
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
        </div>
      </div>

      <nav
        className={cn(
          "flex-1 space-y-1 overflow-y-auto",
          renderCollapsed ? "p-2" : "p-3"
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
                      renderCollapsed
                        ? "px-2 py-2 justify-center"
                        : "px-3 py-2",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <span className="text-muted-foreground group-hover:text-foreground">
                      {item.icon}
                    </span>
                    {!renderCollapsed && <span>{item.title}</span>}
                    {isActive && !renderCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-primary" />
                    )}
                  </Link>
                </TooltipTrigger>
                {renderCollapsed && (
                  <TooltipContent side="right" align="center">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {user && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserAvatar
              name={user.id}
              role={user.role.toLowerCase() as any}
              showTooltip={false}
            />
            {!renderCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.id}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hover-only behavior: no explicit toggle button */}
    </aside>
  );
}
