import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { useNavigate } from "react-router-dom";

interface TopbarProps {
  title?: string;
  onOpenMobileMenu?: () => void;
}

export function Topbar({ title = "", onOpenMobileMenu }: TopbarProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 sticky top-0 z-10 shrink-0">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
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
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 h-9 px-3 bg-background/60 hover:bg-background/80 text-muted-foreground hover:text-foreground border-border/60"
            onClick={() => {
              const event = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              });
              document.dispatchEvent(event);
            }}
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search</span>
            <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0 h-9 w-9"
            onClick={() => {
              const event = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              });
              document.dispatchEvent(event);
            }}
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
