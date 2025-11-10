import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  FolderKanban,
  Users,
  Settings,
  Plus,
  Loader2,
} from "lucide-react";
import { useSearch } from "@/hooks/useSearch";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { results, loading } = useSearch(searchQuery);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    setSearchQuery("");
    callback();
  };

  const hasSearchResults = results.length > 0;
  const hasQuery = searchQuery.trim().length >= 2;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Type a command or search..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && !hasSearchResults && hasQuery && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        {!loading && !hasQuery && (
          <>
            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() => handleSelect(() => navigate("/dashboard"))}
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => navigate("/tickets"))}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Tickets</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => navigate("/projects"))}
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Projects</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => navigate("/users"))}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Users</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => navigate("/settings"))}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem
                onSelect={() => handleSelect(() => navigate("/tickets"))}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>New Ticket</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect(() => navigate("/projects"))}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>New Project</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
        {!loading && hasSearchResults && (
          <>
            {results.filter((r) => r.type === "ticket").length > 0 && (
              <CommandGroup heading="Tickets">
                {results
                  .filter((r) => r.type === "ticket")
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(() => navigate(result.url))}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{result.title}</span>
                        {result.subtitle && (
                          <span className="text-xs text-muted-foreground">
                            {result.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
            {results.filter((r) => r.type === "project").length > 0 && (
              <CommandGroup heading="Projects">
                {results
                  .filter((r) => r.type === "project")
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(() => navigate(result.url))}
                    >
                      <FolderKanban className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{result.title}</span>
                        {result.subtitle && (
                          <span className="text-xs text-muted-foreground">
                            {result.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
            {results.filter((r) => r.type === "user").length > 0 && (
              <CommandGroup heading="Users">
                {results
                  .filter((r) => r.type === "user")
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(() => navigate(result.url))}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{result.title}</span>
                        {result.subtitle && (
                          <span className="text-xs text-muted-foreground">
                            {result.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
