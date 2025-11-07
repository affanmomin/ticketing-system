import { useEffect, useMemo, useState } from "react";
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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TableRowSkeleton } from "@/components/ui/skeleton";
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
import type { Ticket, Project, Client, TicketsListQuery } from "@/types/api";
import { format } from "date-fns";
import { Plus } from "lucide-react";

export function Tickets() {
  const { priorities, statuses } = useTaxonomy();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<
    string | undefined
  >();
  const [listLoading, setListLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [page, setPage] = useState(0);
  const [view, setView] = useState<"table" | "board">(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem("tickets_view")
        : null;
    return saved === "board" ? "board" : "table";
  });
  const pageSize = view === "board" ? 200 : 20;
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    clientId: "all",
    projectId: "all",
    statusId: "all",
    priorityId: "all",
  });

  useEffect(() => {
    (async () => {
      try {
        const [{ data: projectsRes }, { data: clientsRes }] = await Promise.all(
          [
            projectsApi.list({ limit: 200, offset: 0 }),
            clientsApi.list({ limit: 200, offset: 0 }),
          ]
        );
        setProjects(projectsRes.data);
        setClients(clientsRes.data);
      } catch (error) {
        console.warn("Failed to load project/client filter data", error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    view,
    filters.clientId,
    filters.projectId,
    filters.priorityId,
    filters.statusId,
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (page !== 0) {
        setPage(0);
      } else {
        void loadTickets();
      }
    }, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  async function loadTickets() {
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
      setTotal(data.total);

      // API now returns tickets with all related data already populated
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
      toast({
        title: "Failed to load tickets",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setListLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const sortedStatuses = useMemo(() => {
    return [...statuses].sort((a, b) => a.sequence - b.sequence);
  }, [statuses]);

  const visibleStatuses = useMemo(() => {
    return filters.statusId !== "all"
      ? sortedStatuses.filter((s) => s.id === filters.statusId)
      : sortedStatuses;
  }, [sortedStatuses, filters.statusId]);

  async function handleMoveTicket(ticketId: string, toStatusId: string) {
    const current = tickets.find((t) => t.id === ticketId);
    if (!current || current.statusId === toStatusId) return;
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
      const message = error?.response?.data?.message || "Please try again.";
      toast({
        title: "Could not move ticket",
        description: message,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description="Track work across projects and clients"
        actions={
          <div className="flex items-center gap-3">
            <Tabs
              value={view}
              onValueChange={(val) => {
                const next = val as "table" | "board";
                setView(next);
                if (typeof window !== "undefined")
                  window.localStorage.setItem("tickets_view", next);
                setPage(0);
              }}
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
              <DialogContent className="max-w-4xl">
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
                  setFilters((prev) => ({
                    ...prev,
                    search: event.target.value,
                  }));
                  setPage(0);
                }}
                className="w-full sm:col-span-2 lg:w-60"
              />
              <Select
                value={filters.clientId}
                onValueChange={(value) => {
                  setFilters((prev) => ({
                    ...prev,
                    clientId: value,
                    projectId: "all",
                  }));
                  setPage(0);
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
              <Select
                value={filters.projectId}
                onValueChange={(value) => {
                  setFilters((prev) => ({ ...prev, projectId: value }));
                  setPage(0);
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
                  setFilters((prev) => ({ ...prev, statusId: value }));
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.priorityId}
                onValueChange={(value) => {
                  setFilters((prev) => ({ ...prev, priorityId: value }));
                  setPage(0);
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
                          <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                          <div className="h-5 bg-muted rounded w-full animate-pulse" />
                          <div className="flex gap-2">
                            <div className="h-5 bg-muted rounded w-16 animate-pulse" />
                            <div className="h-5 bg-muted rounded w-16 animate-pulse" />
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                            <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
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
                      <TableHead className="min-w-[150px]">Project</TableHead>
                      <TableHead className="min-w-[120px]">Client</TableHead>
                      <TableHead className="text-right min-w-[100px]">
                        Updated
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={7} className="p-0">
                            <TableRowSkeleton columns={7} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : tickets.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
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
                            >
                              <SelectTrigger
                                className="h-7 w-auto text-xs border-0 bg-secondary hover:bg-secondary/80"
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
                          </TableCell>
                          <TableCell className="p-3 sm:p-4">
                            <Badge className="text-xs">
                              {ticket.priorityName || ticket.priorityId}
                            </Badge>
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
            <div className="p-2 sm:p-4">
              <TicketsBoard
                tickets={tickets}
                statuses={visibleStatuses}
                loading={listLoading}
                onCardClick={(id) => {
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
        <Dialog
          open={openEdit}
          onOpenChange={(open) => {
            setOpenEdit(open);
            if (!open) setSelectedTicketId(undefined);
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <TicketEditForm
              ticketId={selectedTicketId}
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
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
