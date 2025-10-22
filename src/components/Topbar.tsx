import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title = "Dashboard" }: TopbarProps) {
  const { signOut } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-card sticky top-0 z-10">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-72 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search or press Cmd + K"
              className="pl-9 bg-background/60 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>

          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
