import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  Settings,
  Building2,
  Tag,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { UserAvatar } from "./UserAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    roles: ["ADMIN", "EMPLOYEE"],
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
    title: "Tags",
    href: "/tags",
    icon: <Tag className="w-5 h-5" />,
    roles: ["ADMIN"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
    roles: ["ADMIN", "EMPLOYEE"],
  },
];

export function Sidebar({
  collapsed = false,
  isMobile = false,
}: {
  collapsed?: boolean;
  isMobile?: boolean;
}) {
  const location = useLocation();
  const { user } = useAuthStore();
  const [hoverOpen, setHoverOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    const roleUpper = (user?.role ?? "").toString().toUpperCase() as
      | "ADMIN"
      | "EMPLOYEE"
      | "CLIENT";
    return !!roleUpper && item.roles.includes(roleUpper);
  });

  // Render-time collapsed state: expand on hover when initially collapsed (desktop only)
  const renderCollapsed = !isMobile && collapsed && !hoverOpen;
  const asideWidth = renderCollapsed ? "w-16" : "w-64";

  return (
    <aside
      className={cn(
        asideWidth,
        "relative bg-card flex flex-col h-full shrink-0 overflow-hidden",
        isMobile
          ? "border-none"
          : "border-r border-border transition-[width] duration-300 ease-in-out"
      )}
      aria-label="Sidebar"
      onMouseEnter={() => {
        if (collapsed && !isMobile) setHoverOpen(true);
      }}
      onMouseLeave={() => {
        if (collapsed && !isMobile) setHoverOpen(false);
      }}
    >
      <div
        className={cn(
          "border-b border-border shrink-0",
          renderCollapsed ? "p-3" : "p-4"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            renderCollapsed ? "justify-center gap-0" : "justify-between gap-2"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            {!renderCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                  Ticketly
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  Project Management
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav
        className={cn(
          "flex-1 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
          renderCollapsed ? "p-2" : "p-3"
        )}
      >
        <TooltipProvider>
          {filteredNavItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(item.href + "/");

            return (
              <Tooltip
                key={item.href}
                disableHoverableContent={!collapsed || isMobile}
              >
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                      renderCollapsed
                        ? "px-2 py-2.5 justify-center"
                        : "px-3 py-2.5 sm:py-2",
                      isActive
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:shadow-sm"
                    )}
                  >
                    <span
                      className={cn(
                        "transition-colors shrink-0",
                        isActive
                          ? "text-accent-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {item.icon}
                    </span>
                    {!renderCollapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                    {isActive && !renderCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-primary" />
                    )}
                  </Link>
                </TooltipTrigger>
                {renderCollapsed && !isMobile && (
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
        <div className="p-3 border-t border-border shrink-0 mt-auto">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent/50",
              renderCollapsed && "justify-center px-2"
            )}
          >
            <UserAvatar
              name={user.fullName || user.email || user.id}
              role={(user.role ?? "").toString().toLowerCase() as any}
              showTooltip={false}
            />
            {!renderCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.fullName || user.email || user.id}
                </p>
                <p className="text-xs text-muted-foreground capitalize truncate">
                  {(user.role ?? "").toString().toLowerCase()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
