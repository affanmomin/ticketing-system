import { useEffect, useState } from "react";
import axios from "axios";
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
import { useTaxonomy } from "@/hooks/useTaxonomy";
import * as clientsApi from "@/api/clients";
import * as projectsApi from "@/api/projects";
import * as streamsApi from "@/api/streams";
import * as subjectsApi from "@/api/subjects";
import * as projectsMembersApi from "@/api/projects";
import * as ticketsApi from "@/api/tickets";
import * as attachmentsApi from "@/api/attachments";
import { toast } from "@/hooks/use-toast";
import type {
  AuthUser,
  Priority,
  Project,
  ProjectMember,
  Status,
  Stream,
  Subject,
} from "@/types/api";
import * as usersApi from "@/api/users";

const UNASSIGNED_VALUE = "__unassigned__";

type TicketCreateFormProps = {
  clientId?: string;
  projectId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type Option = { id: string; name: string };

export function TicketCreateForm({
  clientId,
  projectId,
  onSuccess,
  onCancel,
}: TicketCreateFormProps = {}) {
  const {
    priorities,
    statuses,
    loading: taxonomyLoading,
    refresh: refreshTaxonomy,
  } = useTaxonomy();
  const [clients, setClients] = useState<Option[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    clientId: clientId ?? "",
    projectId: projectId ?? "",
    streamId: "",
    subjectId: "",
    priorityId: "",
    statusId: "",
    title: "",
    descriptionMd: "",
    assignedTo: UNASSIGNED_VALUE,
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await clientsApi.list({ limit: 200, offset: 0 });
        const options = data.data.map((client) => ({
          id: client.id,
          name: client.name,
        }));
        setClients(options);
        if (!clientId && options.length) {
          setForm((prev) => ({ ...prev, clientId: options[0].id }));
        }
      } catch (error) {
        toast({ title: "Failed to load clients", variant: "destructive" });
      }
    })();
  }, [clientId, toast]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await usersApi.list({ limit: 200, offset: 0 });
        setUsers(data.data);
      } catch (error) {
        console.warn("Failed to load users", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!form.clientId) return;
    (async () => {
      try {
        const [projectsRes, streamsRes, subjectsRes] = await Promise.all([
          projectsApi.list({ clientId: form.clientId, limit: 200, offset: 0 }),
          streamsApi.listForClient(form.clientId, { limit: 200, offset: 0 }),
          subjectsApi.listForClient(form.clientId, { limit: 200, offset: 0 }),
        ]);

        const projectItems = projectsRes.data.data;
        const streamItems = streamsRes.data.data;
        const subjectItems = subjectsRes.data.data;

        setProjects(projectItems);
        setStreams(streamItems);
        setSubjects(subjectItems);

        if (!projectId && projectItems.length) {
          setForm((prev) => ({ ...prev, projectId: projectItems[0].id }));
        }

        if (streamItems.length) {
          setForm((prev) => ({ ...prev, streamId: streamItems[0].id }));
        } else {
          setForm((prev) => ({ ...prev, streamId: "" }));
        }

        if (subjectItems.length) {
          setForm((prev) => ({ ...prev, subjectId: subjectItems[0].id }));
        } else {
          setForm((prev) => ({ ...prev, subjectId: "" }));
        }
      } catch (error) {
        toast({
          title: "Failed to load project context",
          variant: "destructive",
        });
      }
    })();
  }, [form.clientId, projectId, toast]);

  useEffect(() => {
    if (!form.projectId) return;
    (async () => {
      try {
        const { data } = await projectsMembersApi.listMembers(form.projectId);
        setMembers(data);
      } catch (error) {
        console.warn("Failed to load project members", error);
      }
    })();
  }, [form.projectId]);

  useEffect(() => {
    if (!taxonomyLoading && (!form.priorityId || !form.statusId)) {
      const firstPriority = priorities.find(
        (priority) => priority.active !== false
      );
      const firstStatus = statuses.find(
        (status) => status.active !== false && !status.isClosed
      );
      setForm((prev) => ({
        ...prev,
        priorityId: prev.priorityId || firstPriority?.id || "",
        statusId: prev.statusId || firstStatus?.id || "",
      }));
    }
  }, [taxonomyLoading, priorities, statuses]);

  const memberOptions = members
    .filter((member) => member.canBeAssigned)
    .map((member) => {
      const user = users.find((u) => u.id === member.userId);
      return {
        id: member.userId,
        name: user?.fullName || user?.email || member.userId,
      };
    });

  const canSubmit =
    form.title.trim() &&
    form.descriptionMd.trim() &&
    form.clientId &&
    form.projectId &&
    form.streamId &&
    form.subjectId &&
    form.priorityId &&
    form.statusId;

  async function handleSubmit() {
    if (!canSubmit || saving) return;
    if (!form.streamId) {
      toast({
        title: "Missing stream",
        description:
          "Create at least one stream for this client before raising tickets.",
        variant: "destructive",
      });
      return;
    }
    if (!form.subjectId) {
      toast({
        title: "Missing subject",
        description:
          "Create at least one subject for this client before raising tickets.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        projectId: form.projectId,
        streamId: form.streamId,
        subjectId: form.subjectId,
        priorityId: form.priorityId,
        statusId: form.statusId,
        title: form.title.trim(),
        descriptionMd: form.descriptionMd.trim(),
        assignedToUserId:
          form.assignedTo === UNASSIGNED_VALUE ? undefined : form.assignedTo,
      };

      const { data } = await ticketsApi.create(payload);

      for (const file of attachments) {
        const presign = await attachmentsApi.presignUpload(data.id, {
          fileName: file.name,
          mimeType: file.type,
        });
        await axios.put(presign.data.uploadUrl, file, {
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });
        await attachmentsApi.confirmUpload(data.id, {
          storageUrl: presign.data.key,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        });
      }

      toast({ title: "Ticket created" });
      setAttachments([]);
      onSuccess?.();
      setForm((prev) => ({
        ...prev,
        title: "",
        descriptionMd: "",
        assignedTo: UNASSIGNED_VALUE,
      }));
    } catch (error: any) {
      toast({
        title: "Failed to create ticket",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Create ticket</h2>
        <p className="text-sm text-muted-foreground">
          Tickets require a client stream and subject to keep work organized.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ticket-client">Client</Label>
            <Select
              value={form.clientId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, clientId: value }))
              }
              disabled={!!clientId}
            >
              <SelectTrigger id="ticket-client">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-project">Project</Label>
            <Select
              value={form.projectId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, projectId: value }))
              }
              disabled={!!projectId}
            >
              <SelectTrigger id="ticket-project">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No projects for this client.
                  </div>
                ) : (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ticket-stream">Stream</Label>
            <Select
              value={form.streamId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, streamId: value }))
              }
            >
              <SelectTrigger id="ticket-stream">
                <SelectValue placeholder="Select stream" />
              </SelectTrigger>
              <SelectContent>
                {streams.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No streams found. Create streams in the client workspace
                    first.
                  </div>
                ) : (
                  streams.map((stream) => (
                    <SelectItem key={stream.id} value={stream.id}>
                      {stream.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-subject">Subject</Label>
            <Select
              value={form.subjectId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, subjectId: value }))
              }
            >
              <SelectTrigger id="ticket-subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No subjects found. Create subjects in the client workspace
                    first.
                  </div>
                ) : (
                  subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ticket-priority">Priority</Label>
            <Select
              value={form.priorityId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, priorityId: value }))
              }
              disabled={taxonomyLoading}
            >
              <SelectTrigger id="ticket-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority: Priority) => (
                  <SelectItem key={priority.id} value={priority.id}>
                    {priority.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-status">Status</Label>
            <Select
              value={form.statusId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, statusId: value }))
              }
              disabled={taxonomyLoading}
            >
              <SelectTrigger id="ticket-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status: Status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticket-title">Title</Label>
          <Input
            id="ticket-title"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder="Brief summary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticket-description">Description</Label>
          <Textarea
            id="ticket-description"
            value={form.descriptionMd}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                descriptionMd: event.target.value,
              }))
            }
            placeholder="Markdown supported"
            className="min-h-[140px]"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ticket-assignee">Assignee (optional)</Label>
            <Select
              value={form.assignedTo}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, assignedTo: value }))
              }
            >
              <SelectTrigger id="ticket-assignee">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                {memberOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {memberOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Add project members to enable assignment.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-attachments">Attachments</Label>
            <Input
              id="ticket-attachments"
              type="file"
              multiple
              onChange={(event) => {
                const files = event.target.files;
                if (files) setAttachments(Array.from(files));
              }}
            />
            {attachments.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {attachments.length} file(s) ready to upload.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
          {saving ? "Creating…" : "Create ticket"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Missing a priority or status?{" "}
        <button className="underline" onClick={refreshTaxonomy}>
          Refresh taxonomy
        </button>
      </p>
    </div>
  );
}

export default TicketCreateForm;
