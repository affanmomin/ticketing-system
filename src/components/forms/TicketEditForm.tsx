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
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    client: "",
    project: "",
    stream: NONE,
    priority: PRIORITY[2],
    type: TYPE[0],
    assignee: NONE,
    dueDate: "",
    points: "" as number | "",
    status: String(STATUS[1]),
    selectedTags: [] as string[],
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
        setFormState({
          title: t.title,
          description: t.descriptionMd ?? "",
          client: t.clientId,
          project: t.projectId,
          stream: (t.streamId as any) ?? NONE,
          priority: (t.priority as any) ?? PRIORITY[2],
          type: (t.type as any) ?? TYPE[0],
          assignee: (t.assigneeId as any) ?? NONE,
          dueDate: t.dueDate
            ? new Date(t.dueDate).toISOString().slice(0, 10)
            : "",
          points: (t.points as any) ?? "",
          status: t.status,
          selectedTags: [],
        });
        setInitialStreamId(t.streamId ?? null);

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
    if (!formState.client) return;
    (async () => {
      const [projectsRes, usersRes, tagsRes] = await Promise.all([
        projectsApi.list({ clientId: formState.client }),
        usersApi.assignableUsers(formState.client),
        tagsApi.list({ clientId: formState.client }),
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
        if (
          formState.assignee !== NONE &&
          !mappedUsers.find((u) => u.id === formState.assignee)
        ) {
          mappedUsers.push({
            id: formState.assignee,
            name: "Current assignee",
          });
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
      setFormState((prev) => ({
        ...prev,
        project: mappedProjects.find((p) => p.id === prev.project)
          ? prev.project
          : mappedProjects[0]?.id || "",
      }));
    })();
  }, [formState.client]);

  // When project changes, reload streams
  useEffect(() => {
    if (!formState.project) return;
    (async () => {
      const { data } = await streamsApi.list(formState.project);
      let mapped = data.map((s) => ({ id: s.id, name: s.name }));
      if (initialStreamId && !mapped.find((s) => s.id === initialStreamId)) {
        mapped = [...mapped, { id: initialStreamId, name: "Current stream" }];
      }
      setStreams(mapped);
      setFormState((prev) => {
        if (prev.stream !== NONE && mapped.find((s) => s.id === prev.stream))
          return prev;
        if (initialStreamId && mapped.find((s) => s.id === initialStreamId))
          return { ...prev, stream: initialStreamId };
        return { ...prev, stream: NONE };
      });
    })();
  }, [formState.project, initialStreamId]);

  function toggleTag(id: string) {
    setFormState((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(id)
        ? prev.selectedTags.filter((x) => x !== id)
        : [...prev.selectedTags, id],
    }));
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
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
        </div>

        <Separator className="md:col-span-2" />

        <div className="space-y-2">
          <Label>Client</Label>
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
        </div>

        <div className="space-y-2">
          <Label>Project</Label>
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
                  {p.name}
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

        <Separator className="md:col-span-2" />

        <div className="space-y-2">
          <Label>Assignee</Label>
          <Select
            value={formState.assignee}
            onValueChange={(v) =>
              setFormState((prev) => ({ ...prev, assignee: String(v) }))
            }
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
          <Select
            value={formState.stream}
            onValueChange={(v) =>
              setFormState((prev) => ({ ...prev, stream: String(v) }))
            }
          >
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
                className={`inline-flex items-center px-2 py-1 rounded ${formState.selectedTags.includes(t.id) ? "bg-white/5" : "bg-transparent"}`}
                aria-pressed={formState.selectedTags.includes(t.id)}
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
            <Select
              value={formState.status}
              onValueChange={(v) =>
                setFormState((prev) => ({ ...prev, status: String(v) }))
              }
            >
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
      </div>

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
          disabled={loading || !formState.title || !formState.description}
          onClick={async () => {
            if (!ticketId) return; // require id to save
            setLoading(true);
            try {
              const patch: any = {
                title: formState.title,
                descriptionMd: formState.description,
                status: formState.status,
                priority: formState.priority,
                type: formState.type,
                assigneeId:
                  formState.assignee === NONE ? undefined : formState.assignee,
                streamId:
                  formState.stream === NONE ? undefined : formState.stream,
                dueDate: formState.dueDate
                  ? new Date(`${formState.dueDate}T00:00:00Z`).toISOString()
                  : undefined,
                points: formState.points === "" ? undefined : formState.points,
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
