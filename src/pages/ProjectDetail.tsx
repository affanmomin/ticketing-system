import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import * as projectsApi from "@/api/projects";
import * as clientsApi from "@/api/clients";
import * as usersApi from "@/api/users";
import * as ticketsApi from "@/api/tickets";
import * as streamsApi from "@/api/streams";
import type {
  Project,
  Client,
  AuthUser,
  ProjectMember,
  Ticket,
  Stream,
} from "@/types/api";
import { format } from "date-fns";
import { CalendarRange, Layers } from "lucide-react";

type ProjectViewModel = Project & {
  clientName?: string;
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const isClient = user?.role === "CLIENT";
  const [project, setProject] = useState<ProjectViewModel | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((client) => map.set(client.id, client.name));
    return map;
  }, [clients]);

  const memberUserMap = useMemo(() => {
    const map = new Map<string, AuthUser>();
    users.forEach((user) => map.set(user.id, user));
    return map;
  }, [users]);

  async function loadProject() {
    if (!id) return;
    setLoading(true);
    try {
      const [
        { data: projectData },
        { data: memberData },
        { data: ticketData },
      ] = await Promise.all([
        projectsApi.get(id),
        projectsApi.listMembers(id),
        ticketsApi.list({ projectId: id, limit: 50, offset: 0 }),
      ]);

      setProject({
        ...projectData,
        clientName: projectData.clientId
          ? clientMap.get(projectData.clientId)
          : undefined,
      });
      setMembers(memberData);
      setTickets(ticketData.data);
    } catch (error: any) {
      toast({
        title: "Failed to load project",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchStreams() {
    if (!id) return;
    setStreamsLoading(true);
    try {
      const { data } = await streamsApi.listForProject(id, {
        limit: 100,
      });
      setStreams(data.data);
    } catch (error: any) {
      toast({
        title: "Failed to load streams",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setStreamsLoading(false);
    }
  }

  async function bootstrap() {
    try {
      // Client users should not fetch clients or users lists
      if (isClient) {
        setClients([]);
        setUsers([]);
      } else {
        const [clientsResponse, usersResponse] = await Promise.all([
          clientsApi.list({ limit: 200, offset: 0 }),
          usersApi.list({ limit: 200, offset: 0 }),
        ]);
        setClients(clientsResponse.data.data);
        setUsers(usersResponse.data.data);
      }
    } catch (error) {
      console.warn("Failed to load bootstrap data", error);
    } finally {
      loadProject();
    }
  }

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchStreams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/projects")}>
          Back to projects
        </Button>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={
          project.description || "This project does not have a description yet."
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Project summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Client
            </p>
            <p className="text-base font-medium">
              {project.clientId
                ? (clientMap.get(project.clientId) ?? project.clientId)
                : "—"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Status
            </p>
            <Badge variant={project.active ? "default" : "secondary"}>
              {project.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Timeline
            </p>
            {project.startDate || project.endDate ? (
              <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
                <CalendarRange className="h-4 w-4" />
                {project.startDate
                  ? format(new Date(project.startDate), "MMM d, yyyy")
                  : "—"}
                <span>→</span>
                {project.endDate
                  ? format(new Date(project.endDate), "MMM d, yyyy")
                  : "—"}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Not set</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Members
            </p>
            <p className="text-base font-medium">{members.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Recent tickets</CardTitle>
          <Button
            variant="ghost"
            onClick={() => navigate(`/tickets?projectId=${project.id}`)}
          >
            View all tickets
          </Button>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-5 bg-muted rounded w-16 animate-pulse" />
                        <div className="h-5 bg-muted rounded w-16 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : tickets.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No tickets yet.
              </div>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Title */}
                      <h3 className="font-medium text-sm line-clamp-2 min-w-0">
                        {ticket.title}
                      </h3>

                      {/* Status and Priority */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {ticket.statusName || ticket.statusId}
                        </Badge>
                        <Badge className="text-xs">
                          {ticket.priorityName || ticket.priorityId}
                        </Badge>
                      </div>

                      {/* Assigned and Updated */}
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-medium shrink-0">
                            Assigned:
                          </span>
                          <span className="truncate">
                            {ticket.assignedToUserId
                              ? (memberUserMap.get(ticket.assignedToUserId)
                                  ?.fullName ?? ticket.assignedToUserId)
                              : "Unassigned"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium shrink-0">Updated:</span>
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
          <div className="hidden md:block rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRowSkeleton key={index} columns={5} />
                  ))
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No tickets yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">
                        {ticket.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ticket.statusName || ticket.statusId}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ticket.priorityName || ticket.priorityId}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ticket.assignedToUserId
                          ? (memberUserMap.get(ticket.assignedToUserId)
                              ?.fullName ?? ticket.assignedToUserId)
                          : "Unassigned"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ticket.updatedAt
                          ? format(new Date(ticket.updatedAt), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> Streams
          </CardTitle>
        </CardHeader>
        <CardContent>
          {streamsLoading ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stream</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRowSkeleton key={index} columns={2} />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : streams.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No streams yet. Streams can be managed from the Projects page.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stream</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streams.map((stream) => {
                    const isParent = !stream.parentStreamId;
                    const parentStream = stream.parentStreamId
                      ? streams.find((s) => s.id === stream.parentStreamId)
                      : null;

                    return (
                      <TableRow key={stream.id} className="hover:bg-muted/40">
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            {!isParent && (
                              <span className="text-muted-foreground text-xs">
                                └─
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {!isParent && parentStream && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {parentStream.name}
                                  </span>
                                )}
                                <span className="font-medium text-sm">
                                  {stream.name}
                                </span>
                              </div>
                              {stream.description && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {stream.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant={
                              stream.active !== false ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {stream.active !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
