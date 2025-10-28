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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState<string>("");
  const [project, setProject] = useState<string>("");
  const [stream, setStream] = useState("");
  const [priority, setPriority] = useState(PRIORITY[2]);
  const [type, setType] = useState(TYPE[0]);
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState<number | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
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
      if (items.length) setClient(items[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!client) return;
    (async () => {
      const { data: projectsData } = await projectsApi.list({
        clientId: client,
      });
      const mapped = projectsData.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
      }));
      setProjects(mapped);
      setProject(mapped[0]?.id || "");
      const { data: usersData } = await usersApi.assignableUsers(client);
      setUsers(usersData.map((u) => ({ id: u.id, name: u.name })));
      const { data: tagsData } = await tagsApi.list({ clientId: client });
      setTags(
        tagsData.map((t) => ({ id: t.id, name: t.name, color: t.color }))
      );
    })();
  }, [client]);

  useEffect(() => {
    if (!project) return;
    (async () => {
      const { data } = await streamsApi.list(project);
      setStreams(data.map((s) => ({ id: s.id, name: s.name })));
    })();
  }, [project]);

  function toggleTag(id: string) {
    setSelectedTags((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list) return;
    setFiles((f) => [...f, ...Array.from(list)]);
  }

  const canSave = useMemo(
    () => title.trim() && description.trim() && client && project,
    [title, description, client, project]
  );

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const payload: any = {
        clientId: client,
        projectId: project,
        title,
        descriptionMd: description,
      };
      if (stream) payload.streamId = stream;
      if (priority) payload.priority = priority;
      if (type) payload.type = type;
      if (assignee) payload.assigneeId = assignee;
      if (dueDate)
        payload.dueDate = new Date(`${dueDate}T00:00:00Z`).toISOString();
      if (points !== "") payload.points = Number(points);
      if (selectedTags.length) payload.tagIds = selectedTags;
      const { data: created } = await ticketsApi.create(payload);
      for (const file of files) {
        await attachmentsApi.upload({ file, ticketId: created.id });
      }
      toast({
        title: "Ticket created",
        description: "Your ticket was created successfully.",
      });
      // Reset form
      setTitle("");
      setDescription("");
      setStream("");
      setPriority("P2");
      setType("TASK");
      setAssignee("");
      setDueDate("");
      setPoints("");
      setSelectedTags([]);
      setFiles([]);
    } catch (e: any) {
      const m = e?.response?.data?.message || "Failed to create ticket";
      toast({ title: "Error", description: m });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Create Ticket</h2>
        <p className="text-sm text-muted-foreground">Create a new work item</p>
      </header>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Title{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
          <Select value={client} onValueChange={(v) => setClient(String(v))}>
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          <Select value={project} onValueChange={(v) => setProject(String(v))}>
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
          <Select value={stream} onValueChange={(v) => setStream(String(v))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="(none)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">(none)</SelectItem>
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
          <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
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
          <Select value={type} onValueChange={(v) => setType(v as any)}>
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
          <Select value={assignee} onValueChange={(v) => setAssignee(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
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
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Points</Label>
          <Input
            type="number"
            value={points as any}
            onChange={(e) =>
              setPoints(e.target.value ? Number(e.target.value) : "")
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
                className={`inline-flex items-center px-2 py-1 rounded ${selectedTags.includes(t.id) ? "bg-white/5" : "bg-transparent"}`}
                aria-pressed={selectedTags.includes(t.id)}
              >
                <Badge style={{ background: t.color }} className="mr-2" />
                <span className="text-sm">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Attachments</Label>
          <input type="file" multiple onChange={onFiles} />
          <div className="space-y-1 mt-2">
            {files.map((f, i) => (
              <div key={i} className="text-sm text-muted-foreground">
                {f.name} — {Math.round(f.size / 1024)} KB
              </div>
            ))}
          </div>
        </div>
      </form>

      <Separator />

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" type="button" disabled={saving}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default TicketCreateForm;

// no-op
