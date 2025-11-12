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
  Layers,
  Users,
  UserPlus,
  UserMinus,
  ListPlus,
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
  DialogDescription,
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
import * as usersApi from "@/api/users";
import * as streamsApi from "@/api/streams";
import * as subjectsApi from "@/api/subjects";
import type { Project, Client, AuthUser, ProjectMember, ProjectMemberRole, Stream, Subject } from "@/types/api";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

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
  
  // Modal states for Streams & Members
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [taxonomyDialog, setTaxonomyDialog] = useState(false);
  const [membersDialog, setMembersDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"streams" | "subjects">("streams");
  
  // Streams & Subjects states
  const [streams, setStreams] = useState<Stream[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [streamForm, setStreamForm] = useState({
    name: "",
    description: "",
    saving: false,
  });
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    description: "",
    saving: false,
  });
  
  // Members states
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [memberRole, setMemberRole] = useState<ProjectMemberRole>("MEMBER");
  const [canRaise, setCanRaise] = useState(true);
  const [canBeAssigned, setCanBeAssigned] = useState(true);
  const [savingMember, setSavingMember] = useState(false);

  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((client) => map.set(client.id, client.name));
    return map;
  }, [clients]);

  // Helper function to format dates properly
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "?";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

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

  async function loadUsers() {
    if (isClient) {
      setUsers([]);
      return;
    }
    try {
      const { data } = await usersApi.list({ limit: 200, offset: 0 });
      setUsers(data.data);
    } catch (error) {
      console.warn("Failed to load users", error);
    }
  }

  // Streams & Subjects handlers
  async function fetchStreams(projectId: string) {
    setStreamsLoading(true);
    try {
      const { data } = await streamsApi.listForProject(projectId, { limit: 100 });
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

  async function fetchSubjects(projectId: string) {
    setSubjectsLoading(true);
    try {
      const { data } = await subjectsApi.listForProject(projectId, { limit: 100 });
      setSubjects(data.data);
    } catch (error: any) {
      toast({
        title: "Failed to load subjects",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSubjectsLoading(false);
    }
  }

  async function handleCreateStream() {
    if (!selectedProject || !streamForm.name.trim()) return;
    setStreamForm((prev) => ({ ...prev, saving: true }));
    try {
      await streamsApi.createForProject(selectedProject.id, {
        name: streamForm.name.trim(),
        description: streamForm.description.trim() || undefined,
      });
      toast({ title: "Stream created" });
      setStreamForm({ name: "", description: "", saving: false });
      await fetchStreams(selectedProject.id);
    } catch (error: any) {
      toast({
        title: "Failed to create stream",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
      setStreamForm((prev) => ({ ...prev, saving: false }));
    }
  }

  async function handleCreateSubject() {
    if (!selectedProject || !subjectForm.name.trim()) return;
    setSubjectForm((prev) => ({ ...prev, saving: true }));
    try {
      await subjectsApi.createForProject(selectedProject.id, {
        name: subjectForm.name.trim(),
        description: subjectForm.description.trim() || undefined,
      });
      toast({ title: "Subject created" });
      setSubjectForm({ name: "", description: "", saving: false });
      await fetchSubjects(selectedProject.id);
    } catch (error: any) {
      toast({
        title: "Failed to create subject",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
      setSubjectForm((prev) => ({ ...prev, saving: false }));
    }
  }

  async function toggleStreamActive(stream: Stream, active: boolean) {
    if (!selectedProject) return;
    try {
      await streamsApi.update(stream.id, { active });
      await fetchStreams(selectedProject.id);
    } catch (error: any) {
      toast({
        title: "Failed to update stream",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  async function toggleSubjectActive(subject: Subject, active: boolean) {
    if (!selectedProject) return;
    try {
      await subjectsApi.update(subject.id, { active });
      await fetchSubjects(selectedProject.id);
    } catch (error: any) {
      toast({
        title: "Failed to update subject",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  async function openTaxonomyDialog(project: Project, tab: "streams" | "subjects") {
    setSelectedProject(project);
    setActiveTab(tab);
    setTaxonomyDialog(true);
    if (tab === "streams") {
      await fetchStreams(project.id);
    } else {
      await fetchSubjects(project.id);
    }
  }

  // Members handlers
  async function loadMembers(projectId: string) {
    try {
      const { data } = await projectsApi.listMembers(projectId);
      setMembers(data);
    } catch (error: any) {
      toast({
        title: "Failed to load members",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  async function openMembersDialog(project: Project) {
    setSelectedProject(project);
    setMembersDialog(true);
    await Promise.all([loadMembers(project.id), loadUsers()]);
  }

  async function handleAddMember() {
    if (!selectedProject || !selectedUserId) return;
    setSavingMember(true);
    try {
      await projectsApi.addMember(selectedProject.id, {
        userId: selectedUserId,
        role: memberRole,
        canRaise,
        canBeAssigned,
      });
      toast({ title: "Member added" });
      setAddMemberDialog(false);
      setSelectedUserId("");
      await loadMembers(selectedProject.id);
    } catch (error: any) {
      toast({
        title: "Failed to add member",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSavingMember(false);
    }
  }

  async function handleUpdateMember(
    member: ProjectMember,
    patch: Partial<ProjectMember>
  ) {
    if (!selectedProject) return;
    try {
      await projectsApi.updateMember(selectedProject.id, member.userId, {
        role: patch.role ?? member.role,
        canRaise: patch.canRaise ?? member.canRaise,
        canBeAssigned: patch.canBeAssigned ?? member.canBeAssigned,
      });
      await loadMembers(selectedProject.id);
    } catch (error: any) {
      toast({
        title: "Failed to update member",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  async function handleRemoveMember(member: ProjectMember) {
    if (!selectedProject) return;
    try {
      await projectsApi.removeMember(selectedProject.id, member.userId);
      toast({ title: "Member removed" });
      await loadMembers(selectedProject.id);
    } catch (error: any) {
      toast({
        title: "Failed to remove member",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  const memberUserMap = useMemo(() => {
    const map = new Map<string, AuthUser>();
    users.forEach((user) => map.set(user.id, user));
    return map;
  }, [users]);

  const availableUsers = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.userId));
    return users.filter((user) => !memberIds.has(user.id));
  }, [users, members]);

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
          <CardTitle className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
            <UsersRound className="h-4 w-4" />
            Active Projects
          </CardTitle>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end md:w-auto">
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
                      ? `${formatDate(project.startDate)} → ${formatDate(project.endDate)}`
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
                              size="sm"
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditProject(project);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              Edit
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
                        ? `${formatDate(project.startDate)} → ${formatDate(project.endDate)}`
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
                                  openTaxonomyDialog(project, "streams");
                                }}
                                title="Manage Streams & Subjects"
                              >
                                <Layers className="h-3.5 w-3.5 mr-2" />
                                Streams
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs sm:text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openMembersDialog(project);
                                }}
                                title="Manage Members"
                              >
                                <Users className="h-3.5 w-3.5 mr-2" />
                                Members
                              </Button>
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

      {/* Streams & Subjects Dialog */}
      <Dialog
        open={taxonomyDialog}
        onOpenChange={(open) => {
          if (!open) {
            setTaxonomyDialog(false);
            setSelectedProject(null);
            setStreams([]);
            setSubjects([]);
            setStreamForm({ name: "", description: "", saving: false });
            setSubjectForm({ name: "", description: "", saving: false });
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Project Taxonomy · {selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Streams and subjects help categorize tickets for this project.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "streams" | "subjects")
            }
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger
                value="streams"
                onClick={async () => {
                  if (selectedProject) await fetchStreams(selectedProject.id);
                }}
              >
                Streams
              </TabsTrigger>
              <TabsTrigger
                value="subjects"
                onClick={async () => {
                  if (selectedProject) await fetchSubjects(selectedProject.id);
                }}
              >
                Subjects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="streams" className="mt-6">
              <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-4 w-4" /> Streams
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[320px] pr-4">
                      {streamsLoading ? (
                        <p className="text-sm text-muted-foreground">
                          Loading streams…
                        </p>
                      ) : streams.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No streams yet. Create one using the form on the
                          right.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {streams.map((stream) => (
                            <div
                              key={stream.id}
                              className="flex items-start justify-between rounded-lg border p-4"
                            >
                              <div>
                                <p className="font-medium">{stream.name}</p>
                                {stream.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {stream.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    stream.active ? "default" : "secondary"
                                  }
                                >
                                  {stream.active ? "Active" : "Inactive"}
                                </Badge>
                                <Switch
                                  checked={stream.active}
                                  onCheckedChange={(checked) =>
                                    toggleStreamActive(stream, checked)
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Create Stream</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stream-name">Name</Label>
                      <Input
                        id="stream-name"
                        value={streamForm.name}
                        onChange={(event) =>
                          setStreamForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Development"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stream-description">Description</Label>
                      <Textarea
                        id="stream-description"
                        value={streamForm.description}
                        onChange={(event) =>
                          setStreamForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Optional details to help teams understand the stream"
                      />
                    </div>
                    <Button
                      onClick={handleCreateStream}
                      disabled={streamForm.saving || !streamForm.name.trim()}
                      className="w-full"
                    >
                      {streamForm.saving ? "Creating…" : "Create Stream"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subjects" className="mt-6">
              <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListPlus className="h-4 w-4" /> Subjects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[320px] pr-4">
                      {subjectsLoading ? (
                        <p className="text-sm text-muted-foreground">
                          Loading subjects…
                        </p>
                      ) : subjects.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No subjects yet. Create one using the form on the
                          right.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {subjects.map((subject) => (
                            <div
                              key={subject.id}
                              className="flex items-start justify-between rounded-lg border p-4"
                            >
                              <div>
                                <p className="font-medium">{subject.name}</p>
                                {subject.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {subject.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    subject.active ? "default" : "secondary"
                                  }
                                >
                                  {subject.active ? "Active" : "Inactive"}
                                </Badge>
                                <Switch
                                  checked={subject.active}
                                  onCheckedChange={(checked) =>
                                    toggleSubjectActive(subject, checked)
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Create Subject</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject-name">Name</Label>
                      <Input
                        id="subject-name"
                        value={subjectForm.name}
                        onChange={(event) =>
                          setSubjectForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Bug"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject-description">Description</Label>
                      <Textarea
                        id="subject-description"
                        value={subjectForm.description}
                        onChange={(event) =>
                          setSubjectForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Optional context for the subject"
                      />
                    </div>
                    <Button
                      onClick={handleCreateSubject}
                      disabled={subjectForm.saving || !subjectForm.name.trim()}
                      className="w-full"
                    >
                      {subjectForm.saving ? "Creating…" : "Create Subject"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Members Dialog */}
      <Dialog
        open={membersDialog}
        onOpenChange={(open) => {
          if (!open) {
            setMembersDialog(false);
            setSelectedProject(null);
            setMembers([]);
            setUsers([]);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Project team · {selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Control who can raise tickets and be assigned on this project.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end">
            <Button onClick={() => setAddMemberDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>

          <div className="mt-4 rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Can raise</TableHead>
                  <TableHead>Assignable</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No members yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => {
                    const memberUser = memberUserMap.get(member.userId);
                    return (
                      <TableRow key={member.userId}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {memberUser?.fullName ||
                                memberUser?.email ||
                                member.userId}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {memberUser?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={member.role}
                            onValueChange={(value) =>
                              handleUpdateMember(member, {
                                role: value as ProjectMemberRole,
                              })
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MANAGER">Manager</SelectItem>
                              <SelectItem value="MEMBER">Member</SelectItem>
                              <SelectItem value="VIEWER">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={member.canRaise}
                            onCheckedChange={(checked) =>
                              handleUpdateMember(member, {
                                canRaise: Boolean(checked),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={member.canBeAssigned}
                            onCheckedChange={(checked) =>
                              handleUpdateMember(member, {
                                canBeAssigned: Boolean(checked),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member)}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Add Member Dialog */}
          <Dialog open={addMemberDialog} onOpenChange={setAddMemberDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add project member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="member-user">User</Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger id="member-user" className="w-full">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {availableUsers.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          All users are already members.
                        </div>
                      ) : (
                        availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.fullName || user.email || user.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="member-role">Role</Label>
                  <Select
                    value={memberRole}
                    onValueChange={(value) =>
                      setMemberRole(value as ProjectMemberRole)
                    }
                  >
                    <SelectTrigger id="member-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="member-raise"
                    checked={canRaise}
                    onCheckedChange={(checked) =>
                      setCanRaise(Boolean(checked))
                    }
                  />
                  <Label htmlFor="member-raise">Can raise tickets</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="member-assign"
                    checked={canBeAssigned}
                    onCheckedChange={(checked) =>
                      setCanBeAssigned(Boolean(checked))
                    }
                  />
                  <Label htmlFor="member-assign">Can be assigned</Label>
                </div>

                <Button
                  onClick={handleAddMember}
                  disabled={!selectedUserId || savingMember}
                  className="w-full"
                >
                  {savingMember ? "Adding…" : "Add member"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    </div>
  );
}
