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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CommentForm } from "@/components/forms/CommentForm";
import { CommentsList } from "@/components/CommentsList";
import AttachmentUpload from "@/components/forms/AttachmentUpload";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { toast } from "@/hooks/use-toast";
import * as ticketsApi from "@/api/tickets";
import * as projectsApi from "@/api/projects";
import * as streamsApi from "@/api/streams";
import * as subjectsApi from "@/api/subjects";
import * as usersApi from "@/api/users";
import type {
  AuthUser,
  Project,
  ProjectMember,
  Stream,
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

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);
    (async () => {
      try {
        const { data: ticketData } = await ticketsApi.get(ticketId);
        const { data: projectData } = await projectsApi.get(
          ticketData.projectId
        );
        const [streamsRes, subjectsRes, membersRes, usersRes] =
          await Promise.all([
            streamsApi.listForClient(projectData.clientId, {
              limit: 200,
              offset: 0,
            }),
            subjectsApi.listForClient(projectData.clientId, {
              limit: 200,
              offset: 0,
            }),
            projectsApi.listMembers(ticketData.projectId),
            usersApi.list({ limit: 200, offset: 0 }),
          ]);

        setTicket(ticketData);
        setProject(projectData);
        const streamList =
          (streamsRes as any).data?.data && (streamsRes as any).data.data.length
            ? (streamsRes as any).data.data
            : [];
        if (
          ticketData.streamId &&
          !streamList.find(
            (stream: Stream) => stream.id === ticketData.streamId
          )
        ) {
          streamList.push({
            id: ticketData.streamId,
            clientId: projectData.clientId,
            name: "Current stream",
            description: null,
            active: true,
            createdAt: ticketData.createdAt,
            updatedAt: ticketData.updatedAt,
          } as Stream);
        }
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
            clientId: projectData.clientId,
            name: "Current subject",
            description: null,
            active: true,
            createdAt: ticketData.createdAt,
            updatedAt: ticketData.updatedAt,
          } as Subject);
        }
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

  const statusOptions = statuses.filter(
    (status) => role !== "CLIENT" || !status.isClosed
  );

  const priorityOptions = priorities;

  const canEditStatus = role !== "CLIENT";

  const disableSubmit =
    !ticketId ||
    saving ||
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
      <p className="text-sm text-muted-foreground">Select a ticket to edit.</p>
    );
  }

  if (loading || !ticket || !project) {
    return (
      <p className="text-sm text-muted-foreground">Loading ticket details…</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Edit ticket</h2>
        <p className="text-sm text-muted-foreground">
          {project.name} · {project.clientId}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="edit-ticket-title">Title</Label>
          <Input
            id="edit-ticket-title"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="edit-ticket-description">Description</Label>
          <Textarea
            id="edit-ticket-description"
            value={form.descriptionMd}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                descriptionMd: event.target.value,
              }))
            }
            className="min-h-[160px]"
            placeholder="Markdown supported"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-ticket-priority">Priority</Label>
          <Select
            value={form.priorityId}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, priorityId: value }))
            }
            disabled={taxonomyLoading}
          >
            <SelectTrigger id="edit-ticket-priority">
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

        <div className="space-y-2">
          <Label htmlFor="edit-ticket-status">Status</Label>
          <Select
            value={form.statusId}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, statusId: value }))
            }
            disabled={!canEditStatus || taxonomyLoading}
          >
            <SelectTrigger id="edit-ticket-status">
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
          {role === "CLIENT" && (
            <p className="text-xs text-muted-foreground">
              Contact your project team to change ticket status.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-ticket-assignee">Assignee</Label>
          <Select
            value={form.assignedToUserId}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, assignedToUserId: value }))
            }
            disabled={assignableMembers.length === 0}
          >
            <SelectTrigger id="edit-ticket-assignee">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {assignableMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {assignableMembers.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Enable "Can be assigned" for project members to populate this
              list.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={ticket.isDeleted ? "secondary" : "default"}>
          Ticket ID · {ticket.id}
        </Badge>
        <Badge variant="outline">
          Created {new Date(ticket.createdAt).toLocaleString()}
        </Badge>
      </div>

      <Separator />

      <AttachmentUpload ticketId={ticketId} />

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={disableSubmit}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Conversation</h3>
          <Button variant="ghost" size="sm" onClick={refreshTaxonomy}>
            Refresh taxonomy
          </Button>
        </div>
        <CommentForm
          ticketId={ticketId}
          onPosted={() => setCommentsRefresh((prev) => prev + 1)}
        />
        <CommentsList ticketId={ticketId} refreshTrigger={commentsRefresh} />
      </div>
    </div>
  );
}

export default TicketEditForm;
