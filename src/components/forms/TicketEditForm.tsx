import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CommentForm } from "@/components/forms/CommentForm";
import { CommentsList } from "@/components/CommentsList";
import { StreamSelector } from "@/components/StreamSelector";
import AttachmentUpload from "@/components/forms/AttachmentUpload";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  FolderOpen,
  Loader2,
  MessageSquare,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Save,
  X,
} from "lucide-react";
import * as ticketsApi from "@/api/tickets";
import * as projectsApi from "@/api/projects";
import * as subjectsApi from "@/api/subjects";
import * as usersApi from "@/api/users";
import type {
  AuthUser,
  Project,
  ProjectMember,
  Subject,
  Ticket,
  TicketUpdateRequest,
  UserRole,
} from "@/types/api";

type TicketEditFormProps = {
  ticketId?: string;
  role?: UserRole;
  onSaved?: (ticket: Ticket) => void;
  onCancel?: () => void;
};

type FormState = {
  title: string;
  descriptionMd: string;
  priorityId: string;
  statusId: string;
  streamId: string;
  subjectId: string;
  assignedToUserId: string;
};

export function TicketEditForm({
  ticketId,
  role = "ADMIN",
  onSaved,
  onCancel,
}: TicketEditFormProps) {
  const {
    priorities,
    statuses,
    loading: taxonomyLoading,
    error: taxonomyError,
    refresh: refreshTaxonomy,
  } = useTaxonomy();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState<FormState>({
    title: "",
    descriptionMd: "",
    priorityId: "",
    statusId: "",
    streamId: "",
    subjectId: "",
    assignedToUserId: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [commentsRefresh, setCommentsRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const [metadataOpen, setMetadataOpen] = useState(false);

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);
    (async () => {
      try {
        const { data: ticketData } = await ticketsApi.get(ticketId);
        const { data: projectData } = await projectsApi.get(
          ticketData.projectId
        );
        const [subjectsRes, membersRes, usersRes] = await Promise.all([
          subjectsApi.listForProject(ticketData.projectId, {
            limit: 200,
            offset: 0,
          }),
          projectsApi.listMembers(ticketData.projectId),
          usersApi.list({ limit: 200, offset: 0 }),
        ]);

        setTicket(ticketData);
        setProject(projectData);
        const subjectList =
          (subjectsRes as any).data?.data &&
          (subjectsRes as any).data.data.length
            ? (subjectsRes as any).data.data
            : [];
        if (
          ticketData.subjectId &&
          !subjectList.find(
            (subject: Subject) => subject.id === ticketData.subjectId
          )
        ) {
          subjectList.push({
            id: ticketData.subjectId,
            projectId: ticketData.projectId,
            name: "Current subject",
            description: null,
            active: true,
            createdAt: ticketData.createdAt,
            updatedAt: ticketData.updatedAt,
          } as Subject);
        }
        setSubjects(subjectList);
        // membersRes is already an array of ProjectMember[]
        setMembers(
          Array.isArray(membersRes) ? membersRes : (membersRes.data ?? [])
        );
        // usersRes is AxiosResponse<PaginatedResponse<AuthUser>>, extract .data.data
        setUsers((usersRes as any).data?.data || []);

        setForm({
          title: ticketData.title,
          descriptionMd: ticketData.descriptionMd ?? "",
          priorityId: ticketData.priorityId,
          statusId: ticketData.statusId,
          streamId: ticketData.streamId,
          subjectId: ticketData.subjectId,
          assignedToUserId: ticketData.assignedToUserId ?? "",
        });
      } catch (error: any) {
        toast({
          title: "Failed to load ticket",
          description: error?.response?.data?.message || "Unexpected error",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [ticketId]);

  useEffect(() => {
    if (taxonomyError) {
      toast({
        title: "Failed to load taxonomy",
        description: taxonomyError,
        variant: "destructive",
      });
    }
  }, [taxonomyError]);

  const assignableMembers = useMemo(() => {
    const eligible = members.filter((member) => member.canBeAssigned);
    return eligible.map((member) => {
      const user = users.find((u) => u.id === member.userId);
      return {
        id: member.userId,
        name: user?.fullName || user?.email || member.userId,
        role: member.role,
      };
    });
  }, [members, users]);

  // Filter statuses: Employees and Clients should not see "Closed" status (only Admin can close tickets)
  const statusOptions = useMemo(() => {
    if (role === "ADMIN") {
      return statuses; // Admin sees all statuses
    }
    // Employees and Clients: exclude "Closed" status
    return statuses.filter((status) => {
      const statusNameLower = status.name.toLowerCase();
      // Exclude if status name contains "closed" or if isClosed flag is true
      return !statusNameLower.includes("closed") && !status.isClosed;
    });
  }, [statuses, role]);

  const priorityOptions = priorities;

  const canEditStatus = role !== "CLIENT";

  // Prevent editing closed tickets (but not resolved)
  const isTicketClosed = (() => {
    const currentStatus = statuses.find((s) => s.id === form.statusId);

    // Use ticket's statusName as fallback if status not found in taxonomy
    const statusName = currentStatus?.name || ticket?.statusName || "";
    const statusNameLower = statusName.toLowerCase();

    // Never lock tickets with "resolved" in the name, regardless of isClosed flag
    if (statusNameLower.includes("resolved")) return false;

    // If status not found, check ticket's statusName
    if (!currentStatus) {
      return statusNameLower.includes("closed");
    }

    // Check if status is explicitly marked as closed
    if (currentStatus.isClosed) return true;

    // Check if status name contains "closed"
    return statusNameLower.includes("closed");
  })();

  const disableSubmit =
    !ticketId ||
    saving ||
    isTicketClosed || // Disable submit if ticket is closed
    !form.title.trim() ||
    !form.descriptionMd.trim() ||
    !form.priorityId ||
    !form.statusId ||
    !form.streamId ||
    !form.subjectId;

  async function handleSubmit() {
    if (!ticketId || disableSubmit) return;
    setSaving(true);
    try {
      const payload: TicketUpdateRequest = {
        title: form.title.trim(),
        descriptionMd: form.descriptionMd.trim(),
        priorityId: form.priorityId,
        statusId: form.statusId,
        assignedToUserId: form.assignedToUserId || null,
      };

      const { data } = await ticketsApi.update(ticketId, payload);
      toast({ title: "Ticket updated" });
      onSaved?.(data);
    } catch (error: any) {
      toast({
        title: "Failed to update ticket",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!ticketId) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          Select a ticket to edit.
        </p>
      </div>
    );
  }

  if (loading || !ticket || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading ticket details…</p>
      </div>
    );
  }

  const currentStatus = statuses.find((s) => s.id === form.statusId);
  const currentPriority = priorities.find((p) => p.id === form.priorityId);

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header with Action Bar */}
      <div className="sticky top-0 z-10 bg-background border-b pb-4 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <h2 className="text-xl font-semibold text-foreground truncate">
                {form.title || "Edit Ticket"}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                <span className="truncate">{project.name}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {currentStatus && (
              <Badge
                variant={currentStatus.isClosed ? "secondary" : "default"}
                className="text-xs"
              >
                {currentStatus.name}
              </Badge>
            )}
            {currentPriority && (
              <Badge variant="outline" className="text-xs">
                {currentPriority.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons - Always Visible */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={disableSubmit}
            className="w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : isTicketClosed ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Ticket Closed
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comments</span>
            </TabsTrigger>
            <TabsTrigger
              value="attachments"
              className="flex items-center gap-2"
            >
              <Paperclip className="h-4 w-4" />
              <span className="hidden sm:inline">Attachments</span>
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-ticket-title"
                    className="text-sm font-medium"
                  >
                    Title
                  </Label>
                  <Input
                    id="edit-ticket-title"
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    disabled={isTicketClosed}
                    className="text-base"
                    placeholder="Enter ticket title"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-ticket-description"
                    className="text-sm font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="edit-ticket-description"
                    value={form.descriptionMd}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        descriptionMd: event.target.value,
                      }))
                    }
                    disabled={isTicketClosed}
                    className="min-h-[180px] resize-none text-sm"
                    placeholder="Describe the issue or request in detail. Markdown is supported."
                  />
                </div>

                {/* Grid of Fields - Following the specified sequence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Ticket No */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Ticket No</Label>
                    <div className="text-sm font-mono text-foreground py-2 px-3 bg-muted rounded-md">
                      {ticket.clientTicketNumber?.trim()?.length
                        ? ticket.clientTicketNumber
                        : ticket.id.substring(0, 8)}
                    </div>
                  </div>

                  {/* 2. Project */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      Project
                    </Label>
                    <div className="text-sm text-foreground py-2 px-3 bg-muted rounded-md">
                      {project.name}
                    </div>
                  </div>

                  {/* 3. Stream */}
                  <div className="space-y-2">
                    <StreamSelector
                      projectId={ticket?.projectId || ""}
                      value={form.streamId}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, streamId: value }))
                      }
                      disabled={isTicketClosed}
                      required
                    />
                  </div>

                  {/* 4. Date Logged */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Date Logged
                    </Label>
                    <div className="text-sm text-foreground py-2 px-3 bg-muted rounded-md">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* 5. Status */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-ticket-status"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      Status
                    </Label>
                    <Select
                      value={form.statusId}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, statusId: value }))
                      }
                      disabled={
                        !canEditStatus || taxonomyLoading || isTicketClosed
                      }
                    >
                      <SelectTrigger id="edit-ticket-status" className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isTicketClosed && (
                      <p className="text-xs text-muted-foreground mt-1">
                        This ticket is closed and cannot be edited.
                      </p>
                    )}
                    {role === "CLIENT" && !isTicketClosed && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Contact your project team to change ticket status.
                      </p>
                    )}
                  </div>

                  {/* 6. Priority */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-ticket-priority"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      Priority
                    </Label>
                    <Select
                      value={form.priorityId}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, priorityId: value }))
                      }
                      disabled={taxonomyLoading || isTicketClosed}
                    >
                      <SelectTrigger
                        id="edit-ticket-priority"
                        className="w-full"
                      >
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority.id} value={priority.id}>
                            {priority.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 7. Assigned To */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-ticket-assignee"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Assigned To
                    </Label>
                    <Select
                      value={form.assignedToUserId || "unassigned"}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          assignedToUserId: value === "unassigned" ? "" : value,
                        }))
                      }
                      disabled={
                        assignableMembers.length === 0 || isTicketClosed
                      }
                    >
                      <SelectTrigger
                        id="edit-ticket-assignee"
                        className="w-full"
                      >
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {assignableMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {assignableMembers.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Enable "Can be assigned" for project members to populate
                        this list.
                      </p>
                    )}
                  </div>

                  {/* 8. Raised By */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Raised By
                    </Label>
                    <div className="text-sm text-foreground py-2 px-3 bg-muted rounded-md">
                      {ticket.raisedByName || ticket.raisedByEmail || "—"}
                    </div>
                  </div>

                  {/* 9. Closed Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      Closed Date
                    </Label>
                    <div className="text-sm text-foreground py-2 px-3 bg-muted rounded-md">
                      {ticket.closedAt
                        ? new Date(ticket.closedAt).toLocaleString()
                        : "—"}
                    </div>
                  </div>

                  {/* 10. Subject */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label
                      htmlFor="edit-ticket-subject"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      Subject
                    </Label>
                    <Select
                      value={form.subjectId}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, subjectId: value }))
                      }
                      disabled={isTicketClosed}
                    >
                      <SelectTrigger
                        id="edit-ticket-subject"
                        className="w-full"
                      >
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Metadata Card - Collapsible */}
            <Collapsible open={metadataOpen} onOpenChange={setMetadataOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Additional Information
                      </CardTitle>
                      {metadataOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Ticket ID
                        </p>
                        <p className="text-sm font-mono text-foreground break-all">
                          {ticket.id}
                        </p>
                      </div>
                      {ticket.updatedAt && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Last Updated
                          </p>
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>
                              {new Date(ticket.updatedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4 mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversation
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshTaxonomy}
                    className="text-xs"
                  >
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CommentForm
                  ticketId={ticketId}
                  onPosted={() => setCommentsRefresh((prev) => prev + 1)}
                />
                <CommentsList
                  ticketId={ticketId}
                  refreshTrigger={commentsRefresh}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-4 mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AttachmentUpload ticketId={ticketId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default TicketEditForm;
