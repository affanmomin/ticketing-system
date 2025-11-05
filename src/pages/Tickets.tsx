import { useEffect, useState } from "react";
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
import * as ticketsApi from "@/api/tickets";
import * as projectsApi from "@/api/projects";
import * as clientsApi from "@/api/clients";
import type {
  Ticket,
  Project,
  Client,
  Priority,
  Status,
  TicketsListQuery,
} from "@/types/api";
import { format } from "date-fns";
import { Plus } from "lucide-react";

type TicketListItem = Ticket & {
  priorityName?: string;
  statusName?: string;
  clientName?: string;
  projectName?: string;
};

export function Tickets() {
  const { priorities, statuses } = useTaxonomy();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<
    string | undefined
  >();
  const [listLoading, setListLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;
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
        await loadTickets();
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
    filters.clientId,
    filters.projectId,
    filters.priorityId,
    filters.statusId,
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadTickets();
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
      const priorityMap = new Map<string, Priority>();
      priorities.forEach((priority) => priorityMap.set(priority.id, priority));
      const statusMap = new Map<string, Status>();
      statuses.forEach((status) => statusMap.set(status.id, status));
      const projectMap = new Map<string, Project>();
      projects.forEach((project) => projectMap.set(project.id, project));
      const clientMap = new Map<string, Client>();
      clients.forEach((client) => clientMap.set(client.id, client));

      const filtered = data.data.filter((ticket) => {
        const matchesSearch = filters.search
          ? ticket.title.toLowerCase().includes(filters.search.toLowerCase())
          : true;
        const matchesClient =
          filters.clientId === "all"
            ? true
            : projectMap.get(ticket.projectId)?.clientId === filters.clientId;
        return matchesSearch && matchesClient;
      });

      const decorated: TicketListItem[] = filtered.map((ticket) => {
        const project = projectMap.get(ticket.projectId);
        const client = project ? clientMap.get(project.clientId) : undefined;
        return {
          ...ticket,
          projectName: project?.name,
          clientName: client?.name,
          priorityName: priorityMap.get(ticket.priorityId)?.name,
          statusName: statusMap.get(ticket.statusId)?.name,
        };
      });

      setTickets(decorated);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description="Track work across projects and clients"
        actions={
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
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="text-muted-foreground">Filters</span>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
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
                className="w-full md:w-60"
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
                <SelectTrigger className="w-full md:w-48">
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
                <SelectTrigger className="w-full md:w-48">
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
                <SelectTrigger className="w-full md:w-44">
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
                <SelectTrigger className="w-full md:w-44">
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Ticket</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Updated</TableHead>
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
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      setOpenEdit(true);
                    }}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {ticket.id.substring(0, 8)}
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate text-sm text-foreground">
                      {ticket.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ticket.statusName || ticket.statusId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{ticket.priorityName || ticket.priorityId}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ticket.projectName || ticket.projectId}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ticket.clientName || "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {ticket.updatedAt
                        ? format(new Date(ticket.updatedAt), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {total} total • Page {page + 1} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={listLoading || page === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={listLoading || page + 1 >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog
        open={openEdit}
        onOpenChange={(open) => {
          setOpenEdit(open);
          if (!open) setSelectedTicketId(undefined);
        }}
      >
        <DialogContent className="max-w-4xl">
          {selectedTicketId && (
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
