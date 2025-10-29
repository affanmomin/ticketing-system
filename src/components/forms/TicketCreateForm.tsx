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
import * as clientsApi from "@/api/clients";
import * as projectsApi from "@/api/projects";
import * as streamsApi from "@/api/streams";
import * as usersApi from "@/api/users";
import * as tagsApi from "@/api/tags";
import * as ticketsApi from "@/api/tickets";
import * as attachmentsApi from "@/api/attachments";
import type { TicketPriority, TicketType } from "@/types/api";
import { toast } from "@/hooks/use-toast";

const PRIORITY: TicketPriority[] = ["P0", "P1", "P2", "P3"];
const TYPE: TicketType[] = ["TASK", "BUG", "STORY", "EPIC"];

export function TicketCreateForm() {
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    client: "",
    project: "",
    stream: "",
    priority: PRIORITY[2],
    type: TYPE[0],
    assignee: "",
    dueDate: "",
    points: "" as number | "",
    selectedTags: [] as string[],
    files: [] as File[],
    saving: false,
  });
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [projects, setProjects] = useState<
    Array<{ id: string; name: string; code: string }>
  >([]);
  const [streams, setStreams] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [tags, setTags] = useState<
    Array<{ id: string; name: string; color: string }>
  >([]);

  useEffect(() => {
    (async () => {
      const { data } = await clientsApi.list({ limit: 200, offset: 0 });
      const items = data.items.map((c) => ({ id: c.id, name: c.name }));
      setClients(items);
      if (items.length)
        setFormState((prev) => ({ ...prev, client: items[0].id }));
    })();
  }, []);

  useEffect(() => {
    if (!formState.client) return;
    (async () => {
      const { data: projectsData } = await projectsApi.list({
        clientId: formState.client,
      });
      const mapped = projectsData.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
      }));
      setProjects(mapped);
      setFormState((prev) => ({ ...prev, project: mapped[0]?.id || "" }));
      const { data: usersData } = await usersApi.assignableUsers(
        formState.client
      );
      setUsers(usersData.map((u) => ({ id: u.id, name: u.name })));
      const { data: tagsData } = await tagsApi.list({
        clientId: formState.client,
      });
      setTags(
        tagsData.map((t) => ({ id: t.id, name: t.name, color: t.color }))
      );
    })();
  }, [formState.client]);

  useEffect(() => {
    if (!formState.project) return;
    (async () => {
      const { data } = await streamsApi.list(formState.project);
      setStreams(data.map((s) => ({ id: s.id, name: s.name })));
    })();
  }, [formState.project]);

  function toggleTag(id: string) {
    setFormState((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(id)
        ? prev.selectedTags.filter((x) => x !== id)
        : [...prev.selectedTags, id],
    }));
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list) return;
    setFormState((prev) => ({
      ...prev,
      files: [...prev.files, ...Array.from(list)],
    }));
  }

  const canSave = useMemo(
    () =>
      formState.title.trim() &&
      formState.description.trim() &&
      formState.client &&
      formState.project,
    [
      formState.title,
      formState.description,
      formState.client,
      formState.project,
    ]
  );

  async function handleSave() {
    if (!canSave || formState.saving) return;
    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      const payload: any = {
        clientId: formState.client,
        projectId: formState.project,
        title: formState.title,
        descriptionMd: formState.description,
      };
      if (formState.stream) payload.streamId = formState.stream;
      if (formState.priority) payload.priority = formState.priority;
      if (formState.type) payload.type = formState.type;
      if (formState.assignee) payload.assigneeId = formState.assignee;
      if (formState.dueDate)
        payload.dueDate = new Date(
          `${formState.dueDate}T00:00:00Z`
        ).toISOString();
      if (formState.points !== "") payload.points = Number(formState.points);
      if (formState.selectedTags.length)
        payload.tagIds = formState.selectedTags;
      const { data: created } = await ticketsApi.create(payload);
      for (const file of formState.files) {
        await attachmentsApi.upload({ file, ticketId: created.id });
      }
      toast({
        title: "Ticket created",
        description: "Your ticket was created successfully.",
      });
      // Reset form
      setFormState({
        title: "",
        description: "",
        client: formState.client,
        project: formState.project,
        stream: "",
        priority: PRIORITY[2],
        type: TYPE[0],
        assignee: "",
        dueDate: "",
        points: "",
        selectedTags: [],
        files: [],
        saving: false,
      });
    } catch (e: any) {
      const m = e?.response?.data?.message || "Failed to create ticket";
      toast({ title: "Error", description: m });
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Create Ticket</h2>
        <p className="text-sm text-muted-foreground">
          Create a new work item for tracking and collaboration
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Title & Client Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ticket-title" className="text-sm font-medium">
              Title
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="ticket-title"
              placeholder="Brief description of the issue or task"
              value={formState.title}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, title: e.target.value }))
              }
              aria-required="true"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-client" className="text-sm font-medium">
              Client
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              value={formState.client}
              onValueChange={(v) =>
                setFormState((prev) => ({ ...prev, client: String(v) }))
              }
            >
              <SelectTrigger id="ticket-client" className="w-full h-10">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="ticket-description" className="text-sm font-medium">
            Description
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Textarea
            id="ticket-description"
            placeholder="Provide detailed information about this ticket (supports markdown)"
            value={formState.description}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, description: e.target.value }))
            }
            aria-required="true"
            className="min-h-[120px] resize-y"
          />
          <p className="text-xs text-muted-foreground">Markdown supported</p>
        </div>

        {/* Project & Stream Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ticket-project" className="text-sm font-medium">
              Project
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              value={formState.project}
              onValueChange={(v) =>
                setFormState((prev) => ({ ...prev, project: String(v) }))
              }
            >
              <SelectTrigger id="ticket-project" className="w-full h-10">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-stream" className="text-sm font-medium">
              Stream
            </Label>
            <Select
              value={formState.stream || "none"}
              onValueChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  stream: v === "none" ? "" : String(v),
                }))
              }
            >
              <SelectTrigger id="ticket-stream" className="w-full h-10">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {streams.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Priority & Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ticket-priority" className="text-sm font-medium">
              Priority
            </Label>
            <Select
              value={formState.priority}
              onValueChange={(v) =>
                setFormState((prev) => ({ ...prev, priority: v as any }))
              }
            >
              <SelectTrigger id="ticket-priority" className="w-full h-10">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-type" className="text-sm font-medium">
              Type
            </Label>
            <Select
              value={formState.type}
              onValueChange={(v) =>
                setFormState((prev) => ({ ...prev, type: v as any }))
              }
            >
              <SelectTrigger id="ticket-type" className="w-full h-10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Assignee & Due Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ticket-assignee" className="text-sm font-medium">
              Assignee
            </Label>
            <Select
              value={formState.assignee || "none"}
              onValueChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  assignee: v === "none" ? "" : v,
                }))
              }
            >
              <SelectTrigger id="ticket-assignee" className="w-full h-10">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-due-date" className="text-sm font-medium">
              Due Date
            </Label>
            <Input
              id="ticket-due-date"
              type="date"
              value={formState.dueDate}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-points" className="text-sm font-medium">
              Story Points
            </Label>
            <Input
              id="ticket-points"
              type="number"
              placeholder="0"
              min="0"
              value={formState.points as any}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  points: e.target.value ? Number(e.target.value) : "",
                }))
              }
              className="h-10"
            />
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-card min-h-[48px]">
              {tags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    formState.selectedTags.includes(t.id)
                      ? "bg-primary/10 ring-1 ring-primary"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                  aria-pressed={formState.selectedTags.includes(t.id)}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: t.color }}
                  />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          variant="outline"
          type="button"
          disabled={formState.saving}
          className="min-w-[80px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!canSave || formState.saving}
          className="min-w-[120px]"
        >
          {formState.saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating
            </span>
          ) : (
            "Create Ticket"
          )}
        </Button>
      </div>
    </div>
  );
}

export default TicketCreateForm;

// no-op
