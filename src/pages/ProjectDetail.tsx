import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import type {
  Project,
  Client,
  AuthUser,
  ProjectMember,
  Ticket,
  ProjectMemberRole,
} from "@/types/api";
import { format } from "date-fns";
import { Users, UserPlus, UserMinus, CalendarRange } from "lucide-react";

type ProjectViewModel = Project & {
  clientName?: string;
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
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
      const [clientsResponse, usersResponse] = await Promise.all([
        clientsApi.list({ limit: 200, offset: 0 }),
        usersApi.list({ limit: 200, offset: 0 }),
      ]);
      setClients(clientsResponse.data.data);
      setUsers(usersResponse.data.data);
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
    try {
      await projectsApi.removeMember(id, member.userId);
      toast({ title: "Member removed" });
      await loadProject();
    } catch (error: any) {
      toast({
        title: "Failed to remove member",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/projects")}>
          Back to projects
        </Button>
        <div className="grid gap-4 md:grid-cols-2">
          <TableRowSkeleton columns={1} />
          <TableRowSkeleton columns={1} />
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
          <Dialog open={membershipDialog} onOpenChange={setMembershipDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Members
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Project team</DialogTitle>
                <DialogDescription>
                  Control who can raise tickets and be assigned on this project.
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
            </DialogContent>
          </Dialog>
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
                          {ticket.statusId}
                        </Badge>
                        <Badge className="text-xs">{ticket.priorityId}</Badge>
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
                    <TableRow key={index}>
                      <TableCell colSpan={5} className="p-0">
                        <TableRowSkeleton columns={5} />
                      </TableCell>
                    </TableRow>
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
                        {ticket.statusId}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ticket.priorityId}
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
    </div>
  );
}
