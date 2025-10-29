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
import { Alert } from "@/components/ui/alert";
import * as clientsApi from "@/api/clients";
import * as projectsApi from "@/api/projects";
import * as streamsApi from "@/api/streams";
import * as usersApi from "@/api/users";
import * as tagsApi from "@/api/tags";
import * as ticketsApi from "@/api/tickets";
import type { Ticket, TicketPriority, TicketType, UserRole } from "@/types/api";

// Static options (same as create)
const STATUS = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "CANCELLED",
] as const;
const PRIORITY: TicketPriority[] = ["P0", "P1", "P2", "P3"];
const TYPE: TicketType[] = ["TASK", "BUG", "STORY", "EPIC"];

const NONE = "__none__"; // sentinel for Radix Select (no empty string values)

type TicketEditFormProps = {
  role?: UserRole;
  ticketId?: string;
  onSaved?: (ticket: Ticket) => void;
  onCancel?: () => void;
};

export function TicketEditForm({
  role = "ADMIN",
  ticketId,
  onSaved,
  onCancel,
}: TicketEditFormProps) {
  const [loading, setLoading] = useState(false);
  const headerTicketId = useMemo(() => ticketId ?? "TKT-101", [ticketId]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState<string>("");
  const [project, setProject] = useState<string>("");
  const [stream, setStream] = useState(NONE);
  const [priority, setPriority] = useState(PRIORITY[2]);
  const [type, setType] = useState(TYPE[0]);
  const [assignee, setAssignee] = useState(NONE);
  const [initialAssigneeId, setInitialAssigneeId] = useState<string | null>(
    null
  );
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState<number | "">("");
  const [status, setStatus] = useState<string>(String(STATUS[1]));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [projects, setProjects] = useState<
    Array<{ id: string; name: string; code: string }>
  >([]);
  const [streams, setStreams] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [initialStreamId, setInitialStreamId] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [tags, setTags] = useState<
    Array<{ id: string; name: string; color: string }>
  >([]);

  // Load ticket and option lists when id provided
  useEffect(() => {
    let mounted = true;
    if (!ticketId) return;
    (async () => {
      setLoading(true);
      try {
        const { data: t } = await ticketsApi.get(ticketId);
        if (!mounted) return;
        // Set fields from ticket
        setTitle(t.title);
        setDescription(t.descriptionMd ?? "");
        setStatus(t.status);
        setPriority((t.priority as any) ?? PRIORITY[2]);
        setType((t.type as any) ?? TYPE[0]);
        setAssignee((t.assigneeId as any) ?? NONE);
        setInitialAssigneeId(t.assigneeId ?? null);
        setStream((t.streamId as any) ?? NONE);
        setInitialStreamId(t.streamId ?? null);
        setPoints((t.points as any) ?? "");
        setDueDate(
          t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : ""
        );

        // Pre-seed option lists so selects show a value before lists load
        if (t.clientId) setClients([{ id: t.clientId, name: "Loading..." }]);
        if (t.projectId)
          setProjects([{ id: t.projectId, name: "Loading...", code: "" }]);
        if (t.assigneeId) setUsers([{ id: t.assigneeId, name: "Loading..." }]);
        if (t.streamId) setStreams([{ id: t.streamId, name: "Loading..." }]);

        // Load clients list
        const { data: clientsPaged } = await clientsApi.list({
          limit: 200,
          offset: 0,
        });
        if (!mounted) return;
        const clientItems = clientsPaged.items.map((c) => ({
          id: c.id,
          name: c.name,
        }));
        const hasClient = !!clientItems.find((c) => c.id === t.clientId);
        setClients(
          hasClient
            ? clientItems
            : [...clientItems, { id: t.clientId, name: "Current client" }]
        );
        setClient(t.clientId);

        // Load dependent lists based on client
        const [projectsRes, usersRes, tagsRes] = await Promise.all([
          projectsApi.list({ clientId: t.clientId }),
          usersApi.assignableUsers(t.clientId),
          tagsApi.list({ clientId: t.clientId }),
        ]);
        if (!mounted) return;
        const mappedProjects = projectsRes.data.map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
        }));
        const hasProject = !!mappedProjects.find((p) => p.id === t.projectId);
        setProjects(
          hasProject
            ? mappedProjects
            : [
                ...mappedProjects,
                { id: t.projectId, name: "Current project", code: "" },
              ]
        );
        const fetchedUsers = usersRes.data.map((u) => ({
          id: u.id,
          name: u.name,
        }));
        const hasAssignee = !!(
          t.assigneeId && fetchedUsers.find((u) => u.id === t.assigneeId)
        );
        setUsers(
          hasAssignee
            ? fetchedUsers
            : t.assigneeId
              ? [
                  ...fetchedUsers,
                  { id: t.assigneeId, name: "Current assignee" },
                ]
              : fetchedUsers
        );
        setTags(
          tagsRes.data.map((tg) => ({
            id: tg.id,
            name: tg.name,
            color: tg.color,
          }))
        );
        setProject(t.projectId);

        // Load streams for project
        if (t.projectId) {
          const { data: streamsData } = await streamsApi.list(t.projectId);
          if (!mounted) return;
          const fetchedStreams = streamsData.map((s) => ({
            id: s.id,
            name: s.name,
          }));
          const hasStream = !!(
            t.streamId && fetchedStreams.find((s) => s.id === t.streamId)
          );
          setStreams(
            hasStream
              ? fetchedStreams
              : t.streamId
                ? [
                    ...fetchedStreams,
                    { id: t.streamId, name: "Current stream" },
                  ]
                : fetchedStreams
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [ticketId]);

  // When client changes, reload projects/users/tags
  useEffect(() => {
    if (!client) return;
    (async () => {
      const [projectsRes, usersRes, tagsRes] = await Promise.all([
        projectsApi.list({ clientId: client }),
        usersApi.assignableUsers(client),
        tagsApi.list({ clientId: client }),
      ]);
      const mappedProjects = projectsRes.data.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
      }));
      setProjects(mappedProjects);
      {
        const mappedUsers = usersRes.data.map((u) => ({
          id: u.id,
          name: u.name,
        }));
        // Ensure current assignee remains selectable if not in list
        if (assignee !== NONE && !mappedUsers.find((u) => u.id === assignee)) {
          mappedUsers.push({ id: assignee, name: "Current assignee" });
        }
        setUsers(mappedUsers);
      }
      setTags(
        tagsRes.data.map((tg) => ({
          id: tg.id,
          name: tg.name,
          color: tg.color,
        }))
      );
      // Maintain current project if present, else choose first
      setProject((prev) =>
        mappedProjects.find((p) => p.id === prev)
          ? prev
          : mappedProjects[0]?.id || ""
      );
    })();
  }, [client]);

  // When project changes, reload streams
  useEffect(() => {
    if (!project) return;
    (async () => {
      const { data } = await streamsApi.list(project);
      let mapped = data.map((s) => ({ id: s.id, name: s.name }));
      if (initialStreamId && !mapped.find((s) => s.id === initialStreamId)) {
        mapped = [...mapped, { id: initialStreamId, name: "Current stream" }];
      }
      setStreams(mapped);
      setStream((prev) => {
        if (prev !== NONE && mapped.find((s) => s.id === prev)) return prev;
        if (initialStreamId && mapped.find((s) => s.id === initialStreamId))
          return initialStreamId;
        return NONE;
      });
    })();
  }, [project]);

  function toggleTag(id: string) {
    setSelectedTags((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-mono">
            {headerTicketId}
          </p>
          <h2 className="text-lg font-semibold">Edit Ticket</h2>
        </div>
        {role === "CLIENT" && (
          <Alert variant="default">
            Status changes are managed by the team.
          </Alert>
        )}
      </header>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="space-y-2 md:col-span-2">
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
        </div>

        <Separator className="md:col-span-2" />

        <div className="space-y-2">
          <Label>Client</Label>
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
        </div>

        <div className="space-y-2">
          <Label>Project</Label>
          <Select value={project} onValueChange={(v) => setProject(String(v))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
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
          <Label>Points</Label>
          <Input
            type="number"
            value={points as any}
            onChange={(e) =>
              setPoints(e.target.value ? Number(e.target.value) : "")
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Due date</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <Separator className="md:col-span-2" />

        <div className="space-y-2">
          <Label>Assignee</Label>
          <Select
            value={assignee}
            onValueChange={(v) => setAssignee(String(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Unassigned</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
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
              <SelectItem value={NONE}>(none)</SelectItem>
              {streams.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                <span
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ background: t.color }}
                />
                <span className="text-sm">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {role !== "CLIENT" && (
          <div className="md:col-span-2 space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(String(v))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form>

      <Separator />

      <div className="flex gap-2 justify-end">
        <Button
          variant="ghost"
          type="button"
          onClick={() => (onCancel ? onCancel() : undefined)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={loading || !title || !description}
          onClick={async () => {
            if (!ticketId) return; // require id to save
            setLoading(true);
            try {
              const patch: any = {
                title,
                descriptionMd: description,
                status,
                priority,
                type,
                assigneeId: assignee === NONE ? undefined : assignee,
                streamId: stream === NONE ? undefined : stream,
                dueDate: dueDate
                  ? new Date(`${dueDate}T00:00:00Z`).toISOString()
                  : undefined,
                points: points === "" ? undefined : points,
                // tagIds: selectedTags.length ? selectedTags : undefined, // left out unless supported
              };
              const { data } = await ticketsApi.update(ticketId, patch);
              onSaved?.(data as Ticket);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default TicketEditForm;
