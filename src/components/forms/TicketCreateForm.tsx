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
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Create Ticket</h2>
        <p className="text-sm text-muted-foreground">Create a new work item</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Title{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Input
            value={formState.title}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, title: e.target.value }))
            }
            aria-required="true"
          />
          <p className="text-xs text-muted-foreground">
            Short descriptive title
          </p>
        </div>

        <div className="space-y-2">
          <Label>
            Client{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Select
            value={formState.client}
            onValueChange={(v) =>
              setFormState((prev) => ({ ...prev, client: String(v) }))
            }
          >
            <SelectTrigger className="w-full">
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
          <p className="text-xs text-muted-foreground">
            Select the owning client
          </p>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>
            Description{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Textarea
            value={formState.description}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, description: e.target.value }))
            }
            aria-required="true"
          />
          <p className="text-xs text-muted-foreground">Supports markdown</p>
        </div>

        <div className="space-y-2">
          <Label>
            Project{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Select
            value={formState.project}
            onValueChange={(v) =>
              setFormState((prev) => ({ ...prev, project: String(v) }))
            }
          >
            <SelectTrigger className="w-full">
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
          <Label>Stream</Label>
          <Select
            value={formState.stream || "none"}
            onValueChange={(v) =>
              setFormState((prev) => ({
                ...prev,
                stream: v === "none" ? "" : String(v),
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="(none)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">(none)</SelectItem>
              {streams.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={formState.priority}
            onValueChange={(v) =>
              setFormState((prev) => ({ ...prev, priority: v as any }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Priority" />
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
          <Label>Type</Label>
          <Select
            value={formState.type}
            onValueChange={(v) =>
              setFormState((prev) => ({ ...prev, type: v as any }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Type" />
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

        <div className="space-y-2">
          <Label>Assignee</Label>
          <Select
            value={formState.assignee || "none"}
            onValueChange={(v) =>
              setFormState((prev) => ({
                ...prev,
                assignee: v === "none" ? "" : v,
              }))
            }
          >
            <SelectTrigger className="w-full">
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
          <Label>Due date</Label>
          <Input
            type="date"
            value={formState.dueDate}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, dueDate: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Points</Label>
          <Input
            type="number"
            value={formState.points as any}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                points: e.target.value ? Number(e.target.value) : "",
              }))
            }
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`inline-flex items-center px-2 py-1 rounded ${formState.selectedTags.includes(t.id) ? "bg-white/5" : "bg-transparent"}`}
                aria-pressed={formState.selectedTags.includes(t.id)}
              >
                <Badge style={{ background: t.color }} className="mr-2" />
                <span className="text-sm">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" type="button" disabled={formState.saving}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!canSave || formState.saving}
        >
          {formState.saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default TicketCreateForm;

// no-op
