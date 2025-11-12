import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import {
  Plus,
  CalendarRange,
  UsersRound,
  Search,
  Building2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import ProjectForm from "@/components/forms/ProjectForm";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import * as projectsApi from "@/api/projects";
import * as clientsApi from "@/api/clients";
import type { Project, Client } from "@/types/api";

const PAGE_SIZE = 20;

export function Projects() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const isClient = user?.role === "CLIENT";
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((client) => map.set(client.id, client.name));
    return map;
  }, [clients]);

  async function loadClients() {
    // Client users should not fetch the clients list
    if (isClient) {
      setClients([]);
      return;
    }

    try {
      const { data } = await clientsApi.list({ limit: 200, offset: 0 });
      setClients(data.data);
    } catch (error) {
      console.warn("Failed to load clients", error);
    }
  }

  async function loadProjects() {
    setLoading(true);
    try {
      const params: projectsApi.ListProjectsQuery = {
        limit: PAGE_SIZE,
        offset,
      };
      if (clientFilter !== "all") params.clientId = clientFilter;

      const { data } = await projectsApi.list(params);
      setProjects(data.data);
      setTotal(data.total);
    } catch (error: any) {
      toast({
        title: "Failed to load projects",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, clientFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (offset !== 0) {
        setOffset(0);
      } else {
        loadProjects();
      }
    }, 250);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.trim().toLowerCase();
    return projects.filter((project) =>
      [project.name, project.description || ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [projects, search]);

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Organize client work and manage delivery timelines"
        actions={
          // Hide "New Project" button for CLIENT users
          !isClient ? (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  {/* <DialogTitle>Create Project</DialogTitle> */}
                </DialogHeader>
                <ProjectForm
                  onSuccess={() => {
                    setCreateOpen(false);
                    loadProjects();
                  }}
                  onCancel={() => setCreateOpen(false)}
                />
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <UsersRound className="h-4 w-4" />
            Active Projects
          </CardTitle>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Select
              value={clientFilter}
              onValueChange={(value) => {
                setClientFilter(value);
                setOffset(0);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All clients" />
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
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or description"
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Mobile Card View */}
          <div className="md:hidden">
            {loading ? (
              <div className="space-y-3 p-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border p-4 space-y-3 bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-4/5 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No projects found.
              </div>
            ) : (
              <div className="space-y-3 p-3">
                {filteredProjects.map((project) => {
                  const clientName = project.clientId
                    ? (clientMap.get(project.clientId) ?? project.clientId)
                    : "—";
                  const timeline =
                    project.startDate || project.endDate
                      ? `${project.startDate ?? "?"} → ${project.endDate ?? "?"}`
                      : "—";

                  return (
                    <div
                      key={project.id}
                      className="rounded-lg border border-border p-4 space-y-3 bg-card"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          <h3 className="font-semibold text-base text-foreground mb-1 truncate">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={project.active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {project.active ? "Active" : "Inactive"}
                          </Badge>
                          {/* Hide Edit button for CLIENT users */}
                          {!isClient && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditProject(project);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{clientName}</span>
                        </div>
                        {(project.startDate || project.endDate) && (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <CalendarRange className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate text-xs">{timeline}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Name</TableHead>
                  <TableHead className="min-w-[150px]">Client</TableHead>
                  <TableHead className="min-w-[180px]">Timeline</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  {/* Hide Actions column for CLIENT users */}
                  {!isClient && (
                    <TableHead className="text-right min-w-[120px]">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRowSkeleton key={index} columns={isClient ? 4 : 5} />
                  ))
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isClient ? 4 : 5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No projects found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => {
                    const clientName = project.clientId
                      ? (clientMap.get(project.clientId) ?? project.clientId)
                      : "—";
                    const timeline =
                      project.startDate || project.endDate
                        ? `${project.startDate ?? "?"} → ${project.endDate ?? "?"}`
                        : "—";

                    return (
                      <TableRow
                        key={project.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="p-3 sm:p-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-sm sm:text-base text-foreground">
                              {project.name}
                            </span>
                            {project.description && (
                              <span className="text-xs text-muted-foreground line-clamp-2">
                                {project.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground p-3 sm:p-4">
                          {clientName}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground p-3 sm:p-4">
                          {project.startDate || project.endDate ? (
                            <span className="inline-flex items-center gap-2">
                              <CalendarRange className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                              <span className="whitespace-nowrap">
                                {timeline}
                              </span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="p-3 sm:p-4">
                          <Badge
                            variant={project.active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {project.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {/* Hide Actions for CLIENT users */}
                        {!isClient && (
                          <TableCell className="text-right p-3 sm:p-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs sm:text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditProject(project);
                                }}
                              >
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs sm:text-sm"
                                onClick={() =>
                                  navigate(`/projects/${project.id}`)
                                }
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 px-3 sm:px-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {total} total • Page {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            {/* <DialogTitle>Edit Project</DialogTitle> */}
          </DialogHeader>
          {editProject && (
            <ProjectForm
              project={editProject}
              onSuccess={() => {
                setEditProject(null);
                loadProjects();
              }}
              onCancel={() => setEditProject(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
