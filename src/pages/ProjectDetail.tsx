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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import * as projectsApi from "@/api/projects";
import * as clientsApi from "@/api/clients";
import * as usersApi from "@/api/users";
import * as ticketsApi from "@/api/tickets";
import * as streamsApi from "@/api/streams";
import * as subjectsApi from "@/api/subjects";
import type {
  Project,
  Client,
  AuthUser,
  ProjectMember,
  Ticket,
  ProjectMemberRole,
  Stream,
  Subject,
} from "@/types/api";
import { format } from "date-fns";
import {
  Users,
  UserPlus,
  UserMinus,
  CalendarRange,
  Layers,
  ListPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

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
  const [loading, setLoading] = useState(true);
  const [membershipDialog, setMembershipDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [memberRole, setMemberRole] = useState<ProjectMemberRole>("MEMBER");
  const [canRaise, setCanRaise] = useState(true);
  const [canBeAssigned, setCanBeAssigned] = useState(true);
  const [savingMember, setSavingMember] = useState(false);
  const [taxonomyDialog, setTaxonomyDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"streams" | "subjects">("streams");
  const [streams, setStreams] = useState<Stream[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [streamForm, setStreamForm] = useState({
    name: "",
    description: "",
    parentStreamId: "",
    saving: false,
  });
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    description: "",
    saving: false,
  });
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(
    null
  );
  const [removingMember, setRemovingMember] = useState(false);

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

  const availableUsers = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.userId));
    return users.filter((user) => !memberIds.has(user.id));
  }, [users, members]);

  async function handleAddMember() {
    if (!id || !selectedUserId) return;
    setSavingMember(true);
    try {
      await projectsApi.addMember(id, {
        userId: selectedUserId,
        role: memberRole,
        canRaise,
        canBeAssigned,
      });
      toast({ title: "Member added" });
      setAddDialog(false);
      setSelectedUserId("");
      await loadProject();
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
    if (!id) return;
    try {
      await projectsApi.updateMember(id, member.userId, {
        role: patch.role ?? member.role,
        canRaise: patch.canRaise ?? member.canRaise,
        canBeAssigned: patch.canBeAssigned ?? member.canBeAssigned,
      });
      await loadProject();
    } catch (error: any) {
      toast({
        title: "Failed to update member",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  async function handleRemoveMember(member: ProjectMember) {
    if (!id) return;
    setRemovingMember(true);
    try {
      await projectsApi.removeMember(id, member.userId);
      toast({ title: "Member removed" });
      setMemberToRemove(null);
      await loadProject();
    } catch (error: any) {
      toast({
        title: "Failed to remove member",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setRemovingMember(false);
    }
  }

  async function fetchStreams(projectId: string) {
    setStreamsLoading(true);
    try {
      const { data } = await streamsApi.listForProject(projectId, {
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

  async function fetchSubjects(projectId: string) {
    setSubjectsLoading(true);
    try {
      const { data } = await subjectsApi.listForProject(projectId, {
        limit: 100,
      });
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
    if (!id || !streamForm.name.trim()) return;
    setStreamForm((prev) => ({ ...prev, saving: true }));
    try {
      await streamsApi.createForProject(id, {
        name: streamForm.name.trim(),
        description: streamForm.description.trim() || undefined,
        parentStreamId: streamForm.parentStreamId || undefined,
      });
      toast({ title: "Stream created" });
      setStreamForm({
        name: "",
        description: "",
        parentStreamId: "",
        saving: false,
      });
      await fetchStreams(id);
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
    if (!id || !subjectForm.name.trim()) return;
    setSubjectForm((prev) => ({ ...prev, saving: true }));
    try {
      await subjectsApi.createForProject(id, {
        name: subjectForm.name.trim(),
        description: subjectForm.description.trim() || undefined,
      });
      toast({ title: "Subject created" });
      setSubjectForm({ name: "", description: "", saving: false });
      await fetchSubjects(id);
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
    if (!id) return;
    try {
      await streamsApi.update(stream.id, { active: Boolean(active) });
      toast({ title: "Stream updated" });
      await fetchStreams(id);
    } catch (error: any) {
      toast({
        title: "Failed to update stream",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  async function toggleSubjectActive(subject: Subject, active: boolean) {
    if (!id) return;
    try {
      await subjectsApi.update(subject.id, { active: Boolean(active) });
      toast({ title: "Subject updated" });
      await fetchSubjects(id);
    } catch (error: any) {
      toast({
        title: "Failed to update subject",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  async function openTaxonomyDialog(tab: "streams" | "subjects") {
    if (!id) return;
    setActiveTab(tab);
    setTaxonomyDialog(true);
    if (tab === "streams") {
      await fetchStreams(id);
    } else {
      await fetchSubjects(id);
    }
  }

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
        actions={
          <div className="flex gap-2">
            {/* <Button
              variant="outline"
              onClick={() => openTaxonomyDialog("streams")}
            >
              <Layers className="mr-2 h-4 w-4" />
              Streams & Subjects
            </Button> */}
            <Dialog open={membershipDialog} onOpenChange={setMembershipDialog}>
              {/* <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Members
                </Button>
              </DialogTrigger> */}
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Project team</DialogTitle>
                  <DialogDescription>
                    Control who can raise tickets and be assigned on this
                    project.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end">
                  <Button onClick={() => setAddDialog(true)}>
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
                                    <SelectItem value="MANAGER">
                                      Manager
                                    </SelectItem>
                                    <SelectItem value="MEMBER">
                                      Member
                                    </SelectItem>
                                    <SelectItem value="VIEWER">
                                      Viewer
                                    </SelectItem>
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
                                  onClick={() => setMemberToRemove(member)}
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

                <Dialog open={addDialog} onOpenChange={setAddDialog}>
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

                <AlertDialog
                  open={memberToRemove !== null}
                  onOpenChange={(open) => {
                    if (!open) setMemberToRemove(null);
                  }}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove member?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {memberToRemove &&
                          `Are you sure you want to remove ${
                            memberUserMap.get(memberToRemove.userId)
                              ?.fullName ||
                            memberUserMap.get(memberToRemove.userId)?.email ||
                            "this member"
                          } from the project? This action cannot be undone.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={removingMember}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (memberToRemove) {
                            handleRemoveMember(memberToRemove);
                          }
                        }}
                        disabled={removingMember}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {removingMember ? "Removing…" : "Remove"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DialogContent>
            </Dialog>
          </div>
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

      <Dialog
        open={taxonomyDialog}
        onOpenChange={(open) => {
          if (!open) {
            setTaxonomyDialog(false);
            setStreams([]);
            setSubjects([]);
            setStreamForm({
              name: "",
              description: "",
              parentStreamId: "",
              saving: false,
            });
            setSubjectForm({ name: "", description: "", saving: false });
          }
        }}
      >
        <DialogContent className="max-w-4xl [&>div]:p-6">
          <DialogHeader>
            <DialogTitle>Project Taxonomy · {project.name}</DialogTitle>
            <DialogDescription>
              Streams and subjects help categorize tickets for this project.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "streams" | "subjects")
            }
            className="mt-6"
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger
                value="streams"
                onClick={async () => {
                  if (id) await fetchStreams(id);
                }}
              >
                Streams
              </TabsTrigger>
              <TabsTrigger
                value="subjects"
                onClick={async () => {
                  if (id) await fetchSubjects(id);
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
                          {streams.map((stream) => {
                            const isParent = !stream.parentStreamId;
                            const parentStream = stream.parentStreamId
                              ? streams.find(
                                  (s) => s.id === stream.parentStreamId
                                )
                              : null;

                            return (
                              <div
                                key={stream.id}
                                className={`flex items-start justify-between rounded-lg border p-4 ${
                                  isParent
                                    ? ""
                                    : "ml-6 border-l-4 border-l-primary/30"
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {!isParent && parentStream && (
                                      <span className="text-xs text-muted-foreground">
                                        {parentStream.name} →
                                      </span>
                                    )}
                                    <p className="font-medium">{stream.name}</p>
                                  </div>
                                  {stream.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {stream.description}
                                    </p>
                                  )}
                                  {isParent && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Parent Stream (Level 1)
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      stream.active !== false
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {stream.active !== false
                                      ? "Active"
                                      : "Inactive"}
                                  </Badge>
                                  <Switch
                                    checked={stream.active !== false}
                                    onCheckedChange={(checked) =>
                                      toggleStreamActive(stream, checked)
                                    }
                                  />
                                </div>
                              </div>
                            );
                          })}
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
                      <Label htmlFor="stream-parent">
                        Parent Stream (Optional)
                      </Label>
                      <Select
                        value={streamForm.parentStreamId || "none"}
                        onValueChange={(value) =>
                          setStreamForm((prev) => ({
                            ...prev,
                            parentStreamId: value === "none" ? "" : value,
                          }))
                        }
                      >
                        <SelectTrigger id="stream-parent">
                          <SelectValue placeholder="None (Create Level 1 Stream)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            None (Create Level 1 Stream)
                          </SelectItem>
                          {streams
                            .filter(
                              (s) => !s.parentStreamId && s.active !== false
                            )
                            .map((stream) => (
                              <SelectItem key={stream.id} value={stream.id}>
                                {stream.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {streamForm.parentStreamId
                          ? "This will create a Level 2 (child) stream under the selected parent"
                          : "This will create a Level 1 (parent) stream"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stream-name">Name *</Label>
                      <Input
                        id="stream-name"
                        value={streamForm.name}
                        onChange={(event) =>
                          setStreamForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder={
                          streamForm.parentStreamId
                            ? "UI Components, API Endpoints, etc."
                            : "Frontend, Backend, Operations, etc."
                        }
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
                                    subject.active !== false
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {subject.active !== false
                                    ? "Active"
                                    : "Inactive"}
                                </Badge>
                                <Switch
                                  checked={subject.active !== false}
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
    </div>
  );
}
