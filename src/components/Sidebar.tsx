import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { UserAvatar } from "./UserAvatar";
import { Button } from "@/components/ui/button";
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
  // {
  //   title: "Tags",
  //   href: "/tags",
  //   icon: <Tag className="w-5 h-5" />,
  //   roles: ["ADMIN"],
  // },
  // {
  //   title: "Settings",
  //   href: "/settings",
  //   icon: <Settings className="w-5 h-5" />,
  //   roles: ["ADMIN", "EMPLOYEE"],
  // },
];

export function Sidebar({
  collapsed = false,
  isMobile = false,
  onToggle,
}: {
  collapsed?: boolean;
  isMobile?: boolean;
  onToggle?: () => void;
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
    <>
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
          "border-b border-border shrink-0 overflow-hidden",
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
            <img
              src="/saait-logo.jpg"
              alt="SAAIT Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
            />
            {!renderCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                  SAAIT
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  Ticketing System
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

            // Only show tooltip when collapsed
            if (renderCollapsed && !isMobile) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                        "px-2 py-2.5 justify-center",
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
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            // Regular link without tooltip when expanded
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                  "px-3 py-2.5 sm:py-2",
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
                <span className="truncate">{item.title}</span>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-primary" />
                )}
              </Link>
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
      {/* Toggle Button - Circular button on the right edge */}
      {!isMobile && onToggle && (
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-50",
            "h-8 w-8 rounded-full shadow-md border-2 bg-card hover:bg-accent",
            "transition-all duration-300"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {/* Show opposite chevron when hovering over collapsed sidebar */}
          {renderCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      )}
    </>
  );
}
