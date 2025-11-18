import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TicketCreateForm } from "@/components/forms/TicketCreateForm";
import { TicketEditForm } from "@/components/forms/TicketEditForm";
import { PageHeader } from "@/components/PageHeader";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketsBoard } from "@/components/TicketsBoard";
import * as ticketsApi from "@/api/tickets";
import * as projectsApi from "@/api/projects";
import * as clientsApi from "@/api/clients";
import type {
  Ticket,
  Project,
  Client,
  TicketsListQuery,
  ProjectMember,
} from "@/types/api";
import { format } from "date-fns";
import { Plus, X, Bookmark, BookmarkPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useFilterPersistence, useSavedViews } from "@/hooks/useSavedViews";
import { useAuthStore } from "@/store/auth";
import * as usersApi from "@/api/users";
import type { AuthUser } from "@/types/api";

export function Tickets() {
  const { priorities, statuses } = useTaxonomy();
  const { user } = useAuthStore();
  const { saveFilters, loadFilters } = useFilterPersistence();
  const { savedViews, saveView, deleteView, loadView } = useSavedViews();
  const location = useLocation();

  // State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [projectMembers, setProjectMembers] = useState<
    Map<string, ProjectMember[]>
  >(new Map());
  const [selectedTicketId, setSelectedTicketId] = useState<
    string | undefined
  >();
  const [listLoading, setListLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<"table" | "board">(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem("tickets_view")
        : null;
    return saved === "board" ? "board" : "table";
  });
  const [filters, setFilters] = useState(() => {
    const saved = loadFilters();
    return (
      saved || {
        search: "",
        clientId: "all",
        projectId: "all",
        statusId: "all",
        priorityId: "all",
      }
    );
  });
  const [saveViewOpen, setSaveViewOpen] = useState(false);
  const [saveViewName, setSaveViewName] = useState("");

  // Refs for optimization
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevFiltersRef = useRef(filters);
  const loadedProjectIdsRef = useRef<Set<string>>(new Set());

  // Memoized values
  const pageSize = useMemo(() => (view === "board" ? 200 : 20), [view]);
  const isClient = useMemo(() => user?.role === "CLIENT", [user?.role]);

  // Check if we should open the create dialog from navigation state
  useEffect(() => {
    const state = location.state as { openCreate?: boolean } | null;
    if (state?.openCreate) {
      setOpenCreate(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Load reference data (projects, clients, users) - Only once on mount
  useEffect(() => {
    let isMounted = true;

    const loadReferenceData = async () => {
      try {
        if (isClient) {
          const { data: projectsRes } = await projectsApi.list({
            limit: 200,
            offset: 0,
          });
          if (isMounted) {
            setProjects(projectsRes.data);
            setClients([]);
            setUsers([]);
          }
        } else {
          const [
            { data: projectsRes },
            { data: clientsRes },
            { data: usersRes },
          ] = await Promise.all([
            projectsApi.list({ limit: 200, offset: 0 }),
            clientsApi.list({ limit: 200, offset: 0 }),
            usersApi.list({ limit: 200, offset: 0 }),
          ]);
          if (isMounted) {
            setProjects(projectsRes.data);
            setClients(clientsRes.data);
            setUsers(usersRes.data);
          }
        }
      } catch (error) {
        console.warn("Failed to load reference data", error);
      }
    };

    loadReferenceData();
    return () => {
      isMounted = false;
    };
  }, [isClient]);

  // Load project members for tickets in current view
  useEffect(() => {
    if (tickets.length === 0) return;

    const loadProjectMembers = async () => {
      // Get unique project IDs from tickets
      const uniqueProjectIds = Array.from(
        new Set(tickets.map((t) => t.projectId))
      );

      // Filter out projects we already have members for
      const projectsToLoad = uniqueProjectIds.filter(
        (projectId) => !loadedProjectIdsRef.current.has(projectId)
      );

      if (projectsToLoad.length === 0) return;

      // Mark projects as loading to prevent duplicate requests
      projectsToLoad.forEach((projectId) => {
        loadedProjectIdsRef.current.add(projectId);
      });

      try {
        // Load members for all projects in parallel
        const memberPromises = projectsToLoad.map(async (projectId) => {
          try {
            const membersRes = await projectsApi.listMembers(projectId);
            // Handle both direct array response and AxiosResponse wrapper
            const members = Array.isArray(membersRes)
              ? membersRes
              : Array.isArray(membersRes.data)
                ? membersRes.data
                : [];
            return { projectId, members };
          } catch (error) {
            console.warn(
              `Failed to load members for project ${projectId}`,
              error
            );
            return { projectId, members: [] };
          }
        });

        const results = await Promise.all(memberPromises);

        // Update the map with new members
        setProjectMembers((prev) => {
          const newMap = new Map(prev);
          results.forEach(({ projectId, members }) => {
            newMap.set(projectId, members);
          });
          return newMap;
        });
      } catch (error) {
        console.warn("Failed to load project members", error);
        // Remove failed projects from loaded set so they can be retried
        projectsToLoad.forEach((projectId) => {
          loadedProjectIdsRef.current.delete(projectId);
        });
      }
    };

    loadProjectMembers();
  }, [tickets]);

  // Single unified effect for all ticket loading triggers
  useEffect(() => {
    let isCurrent = true; // Flag to track if this effect instance is still current

    const prev = prevFiltersRef.current;
    const currentFilters = filters;

    // Check what changed
    const searchChanged = prev.search !== currentFilters.search;
    const nonSearchFiltersChanged =
      prev.clientId !== currentFilters.clientId ||
      prev.projectId !== currentFilters.projectId ||
      prev.statusId !== currentFilters.statusId ||
      prev.priorityId !== currentFilters.priorityId;

    // Update ref
    prevFiltersRef.current = currentFilters;

    // If only search changed, debounce it
    if (searchChanged && !nonSearchFiltersChanged) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (page !== 0) {
          setPage(0);
        } else {
          if (!isCurrent) return; // Effect was cleaned up

          // Cancel previous request
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }

          const controller = new AbortController();
          abortControllerRef.current = controller;

          setListLoading(true);

          (async () => {
            try {
              const query: TicketsListQuery = {
                limit: pageSize,
                offset: page * pageSize,
              };
              if (currentFilters.projectId !== "all")
                query.projectId = currentFilters.projectId;
              if (currentFilters.statusId !== "all")
                query.statusId = currentFilters.statusId;
              if (currentFilters.priorityId !== "all")
                query.priorityId = currentFilters.priorityId;

              const { data } = await ticketsApi.list(query);

              // Check if this effect is still current and request wasn't aborted
              if (!isCurrent || controller.signal.aborted) return;

              setTotal(data.total);

              // Client-side filtering for search and client
              const filtered = data.data.filter((ticket) => {
                const matchesSearch = currentFilters.search
                  ? ticket.title
                      .toLowerCase()
                      .includes(currentFilters.search.toLowerCase())
                  : true;
                const matchesClient =
                  currentFilters.clientId === "all"
                    ? true
                    : ticket.clientId === currentFilters.clientId;
                return matchesSearch && matchesClient;
              });

              setTickets(filtered);
            } catch (error: any) {
              if (
                !isCurrent ||
                error.name === "AbortError" ||
                controller.signal.aborted
              ) {
                return; // Request was cancelled, ignore error
              }
              toast({
                title: "Failed to load tickets",
                description:
                  error?.response?.data?.message || "Unexpected error",
                variant: "destructive",
              });
            } finally {
              if (isCurrent && !controller.signal.aborted) {
                setListLoading(false);
              }
            }
          })();
        }
      }, 300);

      return () => {
        isCurrent = false;
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }

    // For all other changes (filters, page, view), load immediately
    if (!isCurrent) return; // Effect was cleaned up

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setListLoading(true);

    (async () => {
      try {
        const query: TicketsListQuery = {
          limit: pageSize,
          offset: page * pageSize,
        };
        if (currentFilters.projectId !== "all")
          query.projectId = currentFilters.projectId;
        if (currentFilters.statusId !== "all")
          query.statusId = currentFilters.statusId;
        if (currentFilters.priorityId !== "all")
          query.priorityId = currentFilters.priorityId;

        const { data } = await ticketsApi.list(query);

        // Check if this effect is still current and request wasn't aborted
        if (!isCurrent || controller.signal.aborted) return;

        setTotal(data.total);

        // Client-side filtering for search and client
        const filtered = data.data.filter((ticket) => {
          const matchesSearch = currentFilters.search
            ? ticket.title
                .toLowerCase()
                .includes(currentFilters.search.toLowerCase())
            : true;
          const matchesClient =
            currentFilters.clientId === "all"
              ? true
              : ticket.clientId === currentFilters.clientId;
          return matchesSearch && matchesClient;
        });

        setTickets(filtered);
      } catch (error: any) {
        if (
          !isCurrent ||
          error.name === "AbortError" ||
          controller.signal.aborted
        ) {
          return; // Request was cancelled, ignore error
        }
        toast({
          title: "Failed to load tickets",
          description: error?.response?.data?.message || "Unexpected error",
          variant: "destructive",
        });
      } finally {
        if (isCurrent && !controller.signal.aborted) {
          setListLoading(false);
        }
      }
    })();

    return () => {
      isCurrent = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters, page, view, pageSize, toast]);

  // Persist filters to localStorage (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveFilters(filters);
    }, 500);
    return () => clearTimeout(timeout);
  }, [filters, saveFilters]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Stable loadTickets function for manual calls (form success handlers, etc.)
  const loadTickets = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setListLoading(true);
    try {
      const query: TicketsListQuery = {
        limit: pageSize,
        offset: page * pageSize,
      };
      if (filters.projectId !== "all") query.projectId = filters.projectId;
      if (filters.statusId !== "all") query.statusId = filters.statusId;
      if (filters.priorityId !== "all") query.priorityId = filters.priorityId;

      const { data } = await ticketsApi.list(query);

      // Check if request was aborted
      if (controller.signal.aborted) return;

      setTotal(data.total);

      // Client-side filtering for search and client
      const filtered = data.data.filter((ticket) => {
        const matchesSearch = filters.search
          ? ticket.title.toLowerCase().includes(filters.search.toLowerCase())
          : true;
        const matchesClient =
          filters.clientId === "all"
            ? true
            : ticket.clientId === filters.clientId;
        return matchesSearch && matchesClient;
      });

      setTickets(filtered);
    } catch (error: any) {
      if (error.name === "AbortError" || controller.signal.aborted) {
        return; // Request was cancelled, ignore error
      }
      toast({
        title: "Failed to load tickets",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      if (!controller.signal.aborted) {
        setListLoading(false);
      }
    }
  }, [page, pageSize, filters, toast]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  // Filter statuses: Employees and Clients should not see "Closed" status (only Admin can close tickets)
  const isAdmin = useMemo(() => user?.role === "ADMIN", [user?.role]);
  
  const filteredStatuses = useMemo(() => {
    if (isAdmin) {
      return statuses; // Admin sees all statuses
    }
    // Employees and Clients: exclude "Closed" status
    return statuses.filter((status) => {
      const statusNameLower = status.name.toLowerCase();
      // Exclude if status name contains "closed" or if isClosed flag is true
      return !statusNameLower.includes("closed") && !status.isClosed;
    });
  }, [statuses, isAdmin]);

  const sortedStatuses = useMemo(() => {
    return [...filteredStatuses].sort((a, b) => a.sequence - b.sequence);
  }, [filteredStatuses]);

  const visibleStatuses = useMemo(() => {
    return filters.statusId !== "all"
      ? sortedStatuses.filter((s) => s.id === filters.statusId)
      : sortedStatuses;
  }, [sortedStatuses, filters.statusId]);

  // Helper function to get assignable users for a ticket's project
  const getAssignableUsersForTicket = useCallback(
    (ticket: Ticket): AuthUser[] => {
      const members = projectMembers.get(ticket.projectId) || [];
      const assignableMemberIds = members
        .filter((m) => m.canBeAssigned)
        .map((m) => m.userId);

      return users.filter((u) => assignableMemberIds.includes(u.id));
    },
    [projectMembers, users]
  );

  // Optimized handlers with useCallback
  const handleMoveTicket = useCallback(
    async (ticketId: string, toStatusId: string) => {
      const current = tickets.find((t) => t.id === ticketId);
      if (!current || current.statusId === toStatusId) return;
      
      // Prevent moving closed tickets (but not resolved)
      const currentStatus = statuses.find((s) => s.id === current.statusId);
      const statusName = currentStatus?.name || current.statusName || "";
      const statusNameLower = statusName.toLowerCase();
      
      // Never lock tickets with "resolved" in the name, regardless of isClosed flag
      if (statusNameLower.includes("resolved")) {
        // Allow moving resolved tickets
      } else {
        // Check if status is closed (either by flag or name)
        const isClosed = currentStatus?.isClosed || statusNameLower.includes("closed");
        
        if (isClosed) {
          toast({
            title: "Cannot change status",
            description: "Closed tickets cannot be modified.",
            variant: "destructive",
          });
          return;
        }
      }
      
      const toStatusName = statuses.find((s) => s.id === toStatusId)?.name;

      // Optimistic update
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, statusId: toStatusId, statusName: toStatusName }
            : t
        )
      );

      try {
        await ticketsApi.update(ticketId, { statusId: toStatusId });
        toast({
          title: "Ticket updated",
          description: `Moved to ${toStatusName ?? "new status"}`,
        });
      } catch (error: any) {
        // Revert on failure
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  statusId: current.statusId,
                  statusName: current.statusName,
                }
              : t
          )
        );
        toast({
          title: "Could not move ticket",
          description: error?.response?.data?.message || "Please try again.",
          variant: "destructive",
        });
      }
    },
    [tickets, statuses, toast]
  );

  const handleUpdatePriority = useCallback(
    async (ticketId: string, priorityId: string) => {
      const current = tickets.find((t) => t.id === ticketId);
      if (!current || current.priorityId === priorityId) return;
      
      // Prevent updating priority for closed tickets (but not resolved)
      const currentStatus = statuses.find((s) => s.id === current.statusId);
      const statusName = currentStatus?.name || current.statusName || "";
      const statusNameLower = statusName.toLowerCase();
      
      // Never lock tickets with "resolved" in the name, regardless of isClosed flag
      if (statusNameLower.includes("resolved")) {
        // Allow updating resolved tickets
      } else {
        // Check if status is closed (either by flag or name)
        const isClosed = currentStatus?.isClosed || statusNameLower.includes("closed");
        
        if (isClosed) {
          toast({
            title: "Cannot change priority",
            description: "Closed tickets cannot be modified.",
            variant: "destructive",
          });
          return;
        }
      }
      
      const priorityName = priorities.find((p) => p.id === priorityId)?.name;

      // Optimistic update
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, priorityId, priorityName } : t
        )
      );

      try {
        await ticketsApi.update(ticketId, { priorityId });
        toast({
          title: "Ticket updated",
          description: `Priority changed to ${priorityName ?? "new priority"}`,
        });
      } catch (error: any) {
        // Revert on failure
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  priorityId: current.priorityId,
                  priorityName: current.priorityName,
                }
              : t
          )
        );
        toast({
          title: "Could not update priority",
          description: error?.response?.data?.message || "Please try again.",
          variant: "destructive",
        });
      }
    },
    [tickets, priorities, statuses, toast]
  );

  const handleUpdateAssignee = useCallback(
    async (ticketId: string, assignedToUserId: string | null) => {
      const current = tickets.find((t) => t.id === ticketId);
      if (!current || current.assignedToUserId === assignedToUserId) return;
      
      // Prevent updating assignee for closed tickets (but not resolved)
      const currentStatus = statuses.find((s) => s.id === current.statusId);
      const statusName = currentStatus?.name || current.statusName || "";
      const statusNameLower = statusName.toLowerCase();
      
      // Never lock tickets with "resolved" in the name, regardless of isClosed flag
      if (statusNameLower.includes("resolved")) {
        // Allow updating resolved tickets
      } else {
        // Check if status is closed (either by flag or name)
        const isClosed = currentStatus?.isClosed || statusNameLower.includes("closed");
        
        if (isClosed) {
          toast({
            title: "Cannot change assignee",
            description: "Closed tickets cannot be modified.",
            variant: "destructive",
          });
          return;
        }
      }

      // Optimistic update
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, assignedToUserId: assignedToUserId || null }
            : t
        )
      );

      try {
        await ticketsApi.update(ticketId, {
          assignedToUserId: assignedToUserId || null,
        });
        const assigneeName = assignedToUserId
          ? users.find((u) => u.id === assignedToUserId)?.fullName ||
            users.find((u) => u.id === assignedToUserId)?.email ||
            "User"
          : "Unassigned";
        toast({
          title: "Ticket updated",
          description: `Assigned to ${assigneeName}`,
        });
      } catch (error: any) {
        console.error("Failed to update assignee:", error);
        // Revert on failure
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? { ...t, assignedToUserId: current.assignedToUserId }
              : t
          )
        );

        // Check if it's an auth error
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          toast({
            title: "Authentication error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Could not update assignee",
            description: error?.response?.data?.message || "Please try again.",
            variant: "destructive",
          });
        }
      }
    },
    [tickets, users, statuses, toast]
  );

  // Optimized filter update handlers
  const updateFilters = useCallback((updates: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      clientId: "all",
      projectId: "all",
      statusId: "all",
      priorityId: "all",
    });
    setPage(0);
  }, []);

  const handleViewChange = useCallback((newView: "table" | "board") => {
    setView(newView);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tickets_view", newView);
    }
    setPage(0);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "n",
      handler: () => {
        if (!openCreate && !openEdit) {
          setOpenCreate(true);
        }
      },
      description: "Create new ticket",
    },
    {
      key: "Escape",
      handler: () => {
        if (openEdit) {
          setOpenEdit(false);
          setSelectedTicketId(undefined);
        }
        if (openCreate) {
          setOpenCreate(false);
        }
      },
      description: "Close dialog",
    },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description="Track work across projects and clients"
        actions={
          <div className="flex items-center gap-3">
            <Tabs
              value={view}
              onValueChange={(val) =>
                handleViewChange(val as "table" | "board")
              }
            >
              <TabsList>
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="board">Board</TabsTrigger>
              </TabsList>
            </Tabs>
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
                </DialogHeader>
                <TicketCreateForm
                  onSuccess={() => {
                    setOpenCreate(false);
                    void loadTickets();
                  }}
                  onCancel={() => setOpenCreate(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground text-sm sm:text-base">
              Filters
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-2 sm:gap-3">
              <Input
                placeholder="Search title…"
                value={filters.search}
                onChange={(event) => {
                  updateFilters({ search: event.target.value });
                }}
                className="w-full sm:col-span-2 lg:w-60"
              />
              {/* Hide client filter for CLIENT users - they only see their own tickets */}
              {user?.role !== "CLIENT" && (
                <Select
                  value={filters.clientId}
                  onValueChange={(value) => {
                    updateFilters({ clientId: value, projectId: "all" });
                  }}
                >
                  <SelectTrigger className="w-full lg:w-44">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select
                value={filters.projectId}
                onValueChange={(value) => {
                  updateFilters({ projectId: value });
                }}
              >
                <SelectTrigger className="w-full lg:w-44">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {projects
                    .filter((project) =>
                      filters.clientId === "all"
                        ? true
                        : project.clientId === filters.clientId
                    )
                    .map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.statusId}
                onValueChange={(value) => {
                  updateFilters({ statusId: value });
                }}
              >
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {filteredStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.priorityId}
                onValueChange={(value) => {
                  updateFilters({ priorityId: value });
                }}
              >
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id}>
                      {priority.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Quick filters:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetFilters();
                setFilters((prev) => ({
                  ...prev,
                  assignedToUserId: user?.id || "all",
                }));
              }}
              className="h-7 text-xs"
            >
              My Tickets
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetFilters();
                setFilters((prev) => ({
                  ...prev,
                  assignedToUserId: "unassigned",
                }));
              }}
              className="h-7 text-xs"
            >
              Unassigned
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const highPriority = priorities.find((p) =>
                  p.name.toLowerCase().includes("high")
                );
                resetFilters();
                setFilters((prev) => ({
                  ...prev,
                  priorityId: highPriority?.id || "all",
                }));
              }}
              className="h-7 text-xs"
            >
              High Priority
            </Button>
            <Dialog open={saveViewOpen} onOpenChange={setSaveViewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <BookmarkPlus className="mr-1 h-3 w-3" />
                  Save View
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Filter View</DialogTitle>
                  <DialogDescription>
                    Save your current filter combination for quick access
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="view-name">View Name</Label>
                    <Input
                      id="view-name"
                      value={saveViewName}
                      onChange={(e) => setSaveViewName(e.target.value)}
                      placeholder="e.g., My Active Tickets"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSaveViewOpen(false);
                        setSaveViewName("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (saveViewName.trim()) {
                          saveView(saveViewName.trim(), filters);
                          toast({ title: "View saved" });
                          setSaveViewOpen(false);
                          setSaveViewName("");
                        }
                      }}
                      disabled={!saveViewName.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {savedViews.length > 0 && (
              <Select
                value=""
                onValueChange={(value) => {
                  const view = loadView(value);
                  if (view) {
                    setFilters(view.filters);
                    setPage(0);
                  }
                }}
              >
                <SelectTrigger className="h-7 w-auto text-xs border-0">
                  <SelectValue placeholder="Saved views">
                    <Bookmark className="mr-1 h-3 w-3" />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {savedViews.map((view) => (
                    <SelectItem key={view.id} value={view.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{view.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteView(view.id);
                            toast({ title: "View deleted" });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {/* Active Filter Chips */}
          {(filters.search ||
            (user?.role !== "CLIENT" && filters.clientId !== "all") ||
            filters.projectId !== "all" ||
            filters.statusId !== "all" ||
            filters.priorityId !== "all" ||
            (filters as any).assignedToUserId) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                Active filters:
              </span>
              {filters.search && (
                <Badge variant="secondary" className="text-xs">
                  Search: {filters.search}
                  <button
                    onClick={() => updateFilters({ search: "" })}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {/* Hide client filter badge for CLIENT users */}
              {user?.role !== "CLIENT" && filters.clientId !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Client: {clients.find((c) => c.id === filters.clientId)?.name}
                  <button
                    onClick={() =>
                      updateFilters({ clientId: "all", projectId: "all" })
                    }
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.projectId !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Project:{" "}
                  {projects.find((p) => p.id === filters.projectId)?.name}
                  <button
                    onClick={() => updateFilters({ projectId: "all" })}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.statusId !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Status:{" "}
                  {statuses.find((s) => s.id === filters.statusId)?.name}
                  <button
                    onClick={() => updateFilters({ statusId: "all" })}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.priorityId !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Priority:{" "}
                  {priorities.find((p) => p.id === filters.priorityId)?.name}
                  <button
                    onClick={() => updateFilters({ priorityId: "all" })}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(filters as any).assignedToUserId &&
                (filters as any).assignedToUserId !== "all" &&
                (filters as any).assignedToUserId !== "unassigned" && (
                  <Badge variant="secondary" className="text-xs">
                    Assigned:{" "}
                    {users.find(
                      (u) => u.id === (filters as any).assignedToUserId
                    )?.fullName ||
                      users.find(
                        (u) => u.id === (filters as any).assignedToUserId
                      )?.email}
                    <button
                      onClick={() => {
                        const { assignedToUserId, ...rest } = filters as any;
                        setFilters(rest);
                      }}
                      className="ml-1 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              {(filters as any).assignedToUserId === "unassigned" && (
                <Badge variant="secondary" className="text-xs">
                  Unassigned
                  <button
                    onClick={() => {
                      const { assignedToUserId, ...rest } = filters as any;
                      setFilters(rest);
                    }}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-6 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {view === "table" ? (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3 p-3">
                {listLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Ticket ID skeleton */}
                          <div className="h-3 bg-muted rounded w-20 animate-pulse" />

                          {/* Title skeleton */}
                          <div className="space-y-1.5">
                            <div className="h-4 bg-muted rounded w-full animate-pulse" />
                            <div className="h-4 bg-muted rounded w-4/5 animate-pulse" />
                          </div>

                          {/* Status and Priority badges skeleton */}
                          <div className="flex gap-2">
                            <div className="h-6 bg-muted rounded w-20 animate-pulse" />
                            <div className="h-6 bg-muted rounded w-16 animate-pulse" />
                          </div>

                          {/* Project, Client, Date info skeleton */}
                          <div className="space-y-1.5">
                            <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                            <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : tickets.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No tickets found.
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <Card
                      key={ticket.id}
                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedTicketId(ticket.id);
                        setOpenEdit(true);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Ticket ID */}
                          <div className="font-mono text-xs text-muted-foreground">
                            #{ticket.id.substring(0, 8)}
                          </div>

                          {/* Title */}
                          <h3 className="font-medium text-sm line-clamp-2 min-w-0">
                            {ticket.title}
                          </h3>

                          {/* Status and Priority */}
                          <div className="flex flex-wrap gap-2 items-center">
                            <Select
                              value={ticket.statusId}
                              onValueChange={(statusId) => {
                                handleMoveTicket(ticket.id, statusId);
                              }}
                              disabled={(() => {
                                const currentStatus = statuses.find(
                                  (s) => s.id === ticket.statusId
                                );
                                const statusName = currentStatus?.name || ticket.statusName || "";
                                const statusNameLower = statusName.toLowerCase();
                                
                                // Never disable for resolved tickets
                                if (statusNameLower.includes("resolved")) return false;
                                
                                // Check if closed (by flag or name)
                                return currentStatus?.isClosed || statusNameLower.includes("closed");
                              })()}
                            >
                              <SelectTrigger
                                className="h-6 w-auto text-xs border-0 bg-secondary hover:bg-secondary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SelectValue>
                                  {ticket.statusName || ticket.statusId}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {sortedStatuses.map((status) => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Badge className="text-xs">
                              {ticket.priorityName || ticket.priorityId}
                            </Badge>
                          </div>

                          {/* Project, Client, and Date */}
                          <div className="space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-medium shrink-0">
                                Project:
                              </span>
                              <span className="truncate">
                                {ticket.projectName || ticket.projectId}
                              </span>
                            </div>
                            {ticket.clientName && (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-medium shrink-0">
                                  Client:
                                </span>
                                <span className="truncate">
                                  {ticket.clientName}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium shrink-0">
                                Updated:
                              </span>
                              <span>
                                {ticket.updatedAt
                                  ? format(
                                      new Date(ticket.updatedAt),
                                      "MMM d, yyyy"
                                    )
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Ticket</TableHead>
                      <TableHead className="min-w-[200px]">Title</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Priority</TableHead>
                      <TableHead className="min-w-[120px]">Assignee</TableHead>
                      <TableHead className="min-w-[150px]">Project</TableHead>
                      <TableHead className="min-w-[120px]">Client</TableHead>
                      <TableHead className="text-right min-w-[100px]">
                        Updated
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listLoading ? (
                      Array.from({ length: 8 }).map((_, index) => (
                        <TableRow key={index}>
                          {/* Ticket ID */}
                          <TableCell className="p-3 sm:p-4">
                            <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                          </TableCell>
                          {/* Title */}
                          <TableCell className="p-3 sm:p-4">
                            <div className="space-y-1.5">
                              <div className="h-4 bg-muted rounded w-full animate-pulse" />
                              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                            </div>
                          </TableCell>
                          {/* Status */}
                          <TableCell className="p-3 sm:p-4">
                            <div className="h-7 bg-muted rounded w-20 animate-pulse" />
                          </TableCell>
                          {/* Priority */}
                          <TableCell className="p-3 sm:p-4">
                            <div className="h-7 bg-muted rounded w-20 animate-pulse" />
                          </TableCell>
                          {/* Assignee */}
                          <TableCell className="p-3 sm:p-4">
                            <div className="h-7 bg-muted rounded w-24 animate-pulse" />
                          </TableCell>
                          {/* Project */}
                          <TableCell className="p-3 sm:p-4">
                            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                          </TableCell>
                          {/* Client */}
                          <TableCell className="p-3 sm:p-4">
                            <div className="h-4 bg-muted rounded w-28 animate-pulse" />
                          </TableCell>
                          {/* Updated */}
                          <TableCell className="p-3 sm:p-4 text-right">
                            <div className="h-3 bg-muted rounded w-20 ml-auto animate-pulse" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : tickets.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          No tickets found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tickets.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            setSelectedTicketId(ticket.id);
                            setOpenEdit(true);
                          }}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground p-3 sm:p-4">
                            {ticket.id.substring(0, 8)}
                          </TableCell>
                          <TableCell className="max-w-[320px] truncate text-xs sm:text-sm text-foreground p-3 sm:p-4">
                            {ticket.title}
                          </TableCell>
                          <TableCell className="p-3 sm:p-4">
                            <Select
                              value={ticket.statusId}
                              onValueChange={(statusId) => {
                                handleMoveTicket(ticket.id, statusId);
                              }}
                              disabled={(() => {
                                const currentStatus = statuses.find(
                                  (s) => s.id === ticket.statusId
                                );
                                const statusName = currentStatus?.name || ticket.statusName || "";
                                const statusNameLower = statusName.toLowerCase();
                                
                                // Never disable for resolved tickets
                                if (statusNameLower.includes("resolved")) return false;
                                
                                // Check if closed (by flag or name)
                                return currentStatus?.isClosed || statusNameLower.includes("closed");
                              })()}
                            >
                              <SelectTrigger
                                className="h-7 w-auto text-xs border-0 bg-secondary hover:bg-secondary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SelectValue>
                                  {ticket.statusName || ticket.statusId}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent
                                onClick={(e) => e.stopPropagation()}
                              >
                                {sortedStatuses.map((status) => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="p-3 sm:p-4">
                            <Select
                              value={ticket.priorityId}
                              onValueChange={(priorityId) => {
                                handleUpdatePriority(ticket.id, priorityId);
                              }}
                              disabled={(() => {
                                const currentStatus = statuses.find(
                                  (s) => s.id === ticket.statusId
                                );
                                const statusName = currentStatus?.name || ticket.statusName || "";
                                const statusNameLower = statusName.toLowerCase();
                                
                                // Never disable for resolved tickets
                                if (statusNameLower.includes("resolved")) return false;
                                
                                // Check if closed (by flag or name)
                                return currentStatus?.isClosed || statusNameLower.includes("closed");
                              })()}
                            >
                              <SelectTrigger
                                className="h-7 w-auto text-xs border-0 bg-secondary hover:bg-secondary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SelectValue>
                                  {ticket.priorityName || ticket.priorityId}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent
                                onClick={(e) => e.stopPropagation()}
                              >
                                {priorities.map((priority) => (
                                  <SelectItem
                                    key={priority.id}
                                    value={priority.id}
                                  >
                                    {priority.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="p-3 sm:p-4">
                            <Select
                              value={ticket.assignedToUserId || "unassigned"}
                              onValueChange={(value) => {
                                try {
                                  handleUpdateAssignee(
                                    ticket.id,
                                    value === "unassigned" ? null : value
                                  );
                                } catch (err) {
                                  console.error(
                                    "Error updating assignee:",
                                    err
                                  );
                                }
                              }}
                              disabled={(() => {
                                const currentStatus = statuses.find(
                                  (s) => s.id === ticket.statusId
                                );
                                const statusName = currentStatus?.name || ticket.statusName || "";
                                const statusNameLower = statusName.toLowerCase();
                                
                                // Never disable for resolved tickets
                                if (statusNameLower.includes("resolved")) return false;
                                
                                // Check if closed (by flag or name)
                                return currentStatus?.isClosed || statusNameLower.includes("closed");
                              })()}
                            >
                              <SelectTrigger
                                className="h-7 w-auto text-xs border-0 bg-secondary hover:bg-secondary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SelectValue>
                                  {ticket.assignedToUserId
                                    ? (() => {
                                        const assignableUsers =
                                          getAssignableUsersForTicket(ticket);
                                        const assignedUser =
                                          assignableUsers.find(
                                            (u) =>
                                              u.id === ticket.assignedToUserId
                                          );
                                        return (
                                          assignedUser?.fullName ||
                                          assignedUser?.email ||
                                          users.find(
                                            (u) =>
                                              u.id === ticket.assignedToUserId
                                          )?.fullName ||
                                          users.find(
                                            (u) =>
                                              u.id === ticket.assignedToUserId
                                          )?.email ||
                                          "User"
                                        );
                                      })()
                                    : "Unassigned"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SelectItem value="unassigned">
                                  Unassigned
                                </SelectItem>
                                {getAssignableUsersForTicket(ticket).map(
                                  (user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.fullName || user.email || user.id}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm text-muted-foreground p-3 sm:p-4">
                            {ticket.projectName || ticket.projectId}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm text-muted-foreground p-3 sm:p-4">
                            {ticket.clientName || "—"}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {ticket.updatedAt
                              ? format(
                                  new Date(ticket.updatedAt),
                                  "MMM d, yyyy"
                                )
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="p-1 sm:p-2">
              <TicketsBoard
                tickets={tickets}
                statuses={visibleStatuses}
                loading={listLoading}
                onCardClick={(id) => {
                  setSelectedTicketId(id);
                  setOpenEdit(true);
                }}
                onEditTicket={(id) => {
                  setSelectedTicketId(id);
                  setOpenEdit(true);
                }}
                onMoveTicket={handleMoveTicket}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {view === "table" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-3 md:px-0">
          <div className="text-xs sm:text-sm text-muted-foreground">
            {total} total • Page {page + 1} of {totalPages}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={listLoading || page === 0}
              className="flex-1 sm:flex-initial"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={listLoading || page + 1 >= totalPages}
              className="flex-1 sm:flex-initial"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {selectedTicketId && (
        <Sheet
          open={openEdit}
          onOpenChange={(open) => {
            setOpenEdit(open);
            if (!open) setSelectedTicketId(undefined);
          }}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto"
          >
            <SheetHeader className="pb-4 border-b">
              <SheetTitle>Edit Ticket</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <TicketEditForm
                ticketId={selectedTicketId}
                role={user?.role || "CLIENT"}
                onSaved={() => {
                  setOpenEdit(false);
                  setSelectedTicketId(undefined);
                  void loadTickets();
                }}
                onCancel={() => {
                  setOpenEdit(false);
                  setSelectedTicketId(undefined);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
