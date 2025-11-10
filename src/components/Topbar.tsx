import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  X,
  FileText,
  FolderKanban,
  Users,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuthStore } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title?: string;
  onOpenMobileMenu?: () => void;
}

export function Topbar({ title = "Dashboard", onOpenMobileMenu }: TopbarProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { results, loading } = useSearch(searchQuery);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleResultClick = (url: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
    } else if (e.key === "Enter" && results.length > 0) {
      handleResultClick(results[0].url);
    }
  };

  const hasResults = results.length > 0;
  const hasQuery = searchQuery.trim().length >= 2;

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
          {/* Desktop Search */}
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative w-48 lg:w-72 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search or press Cmd + K"
                  className="pl-9 h-9 bg-background/60 focus-visible:ring-1 focus-visible:ring-primary/30 cursor-text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={handleKeyDown}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
            >
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!loading && !hasResults && hasQuery && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              )}
              {!loading && !hasQuery && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Start typing to search...
                </div>
              )}
              {!loading && hasResults && (
                <div className="max-h-[300px] overflow-y-auto">
                  {results.filter((r) => r.type === "ticket").length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Tickets
                      </div>
                      {results
                        .filter((r) => r.type === "ticket")
                        .map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result.url)}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                            )}
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="truncate">{result.title}</span>
                              {result.subtitle && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {result.subtitle}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                  {results.filter((r) => r.type === "project").length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Projects
                      </div>
                      {results
                        .filter((r) => r.type === "project")
                        .map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result.url)}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                            )}
                          >
                            <FolderKanban className="h-4 w-4 shrink-0" />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="truncate">{result.title}</span>
                              {result.subtitle && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {result.subtitle}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                  {results.filter((r) => r.type === "user").length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Users
                      </div>
                      {results
                        .filter((r) => r.type === "user")
                        .map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result.url)}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                            )}
                          >
                            <Users className="h-4 w-4 shrink-0" />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="truncate">{result.title}</span>
                              {result.subtitle && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {result.subtitle}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0 h-9 w-9"
            onClick={() => {
              // Open command palette on mobile
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
