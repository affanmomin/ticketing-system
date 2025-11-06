import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { useNavigate } from "react-router-dom";

interface TopbarProps {
  title?: string;
  onOpenMobileMenu?: () => void;
}

export function Topbar({ title = "Dashboard", onOpenMobileMenu }: TopbarProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 sticky top-0 z-10 shrink-0">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0 h-9 w-9"
            onClick={onOpenMobileMenu}
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Open menu</span>
          </Button>
          <h2 className="text-base sm:text-lg font-semibold text-foreground tracking-tight truncate">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
          <div className="relative w-48 lg:w-72 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search or press Cmd + K"
              className="pl-9 h-9 bg-background/60 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0 h-9 w-9"
          >
            <Search className="w-4 h-4" />
            <span className="sr-only">Search</span>
          </Button>

          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="text-muted-foreground hover:text-foreground hidden sm:flex"
          >
            Sign Out
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="text-muted-foreground hover:text-foreground sm:hidden h-9 w-9"
            title="Sign Out"
          >
            <span className="text-xs font-medium">Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
