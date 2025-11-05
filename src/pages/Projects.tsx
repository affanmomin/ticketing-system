import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CalendarRange, UsersRound, Search } from "lucide-react";
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((client) => map.set(client.id, client.name));
    return map;
  }, [clients]);

  async function loadClients() {
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
      setOffset(0);
      loadProjects();
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
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
              </DialogHeader>
              <ProjectForm
                onSuccess={() => {
                  setCreateOpen(false);
                  loadProjects();
                }}
              />
            </DialogContent>
          </Dialog>
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
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={5} className="p-0">
                        <TableRowSkeleton columns={5} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
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
                      <TableRow key={project.id} className="hover:bg-muted/40">
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-foreground">
                              {project.name}
                            </span>
                            {project.description && (
                              <span className="text-xs text-muted-foreground line-clamp-2">
                                {project.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {clientName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {project.startDate || project.endDate ? (
                            <span className="inline-flex items-center gap-2">
                              <CalendarRange className="h-4 w-4" />
                              {timeline}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={project.active ? "default" : "secondary"}
                          >
                            {project.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            View details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
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
    </div>
  );
}
