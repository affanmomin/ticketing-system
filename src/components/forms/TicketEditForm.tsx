import { useState } from "react";
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

// Static options (same as create)
const STATUS = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "CANCELLED",
] as const;
const PRIORITY = ["P0", "P1", "P2", "P3"] as const;
const TYPE = ["TASK", "BUG", "STORY", "EPIC"] as const;
const CLIENTS = [
  { id: "c1", name: "Acme Co" },
  { id: "c2", name: "Globex" },
];
const PROJECTS = [
  { id: "p1", name: "Website", code: "ACM" },
  { id: "p2", name: "Mobile", code: "MOB" },
];
const STREAMS = [
  { id: "s1", name: "Frontend" },
  { id: "s2", name: "Backend" },
];
const USERS = [
  { id: "u1", name: "Dev One" },
  { id: "u2", name: "Dev Two" },
];
const TAGS = [
  { id: "t1", name: "urgent", color: "#ef4444" },
  { id: "t2", name: "ux", color: "#8b5cf6" },
];

export function TicketEditForm({
  role = "ADMIN" as "ADMIN" | "EMPLOYEE" | "CLIENT",
}) {
  const [ticketId] = useState("TKT-101");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState(CLIENTS[0].id);
  const [project, setProject] = useState(PROJECTS[0].id);
  const [stream, setStream] = useState("");
  const [priority, setPriority] = useState(PRIORITY[2]);
  const [type, setType] = useState(TYPE[0]);
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState<number | "">("");
  const [status, setStatus] = useState<string>(String(STATUS[1]));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function toggleTag(id: string) {
    setSelectedTags((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-mono">{ticketId}</p>
          <h2 className="text-lg font-semibold">Edit Ticket</h2>
        </div>
        {role === "CLIENT" && (
          <Alert variant="default">
            Status changes are managed by the team.
          </Alert>
        )}
      </header>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {CLIENTS.map((c) => (
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
              {PROJECTS.map((p) => (
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
          <Select value={assignee} onValueChange={(v) => setAssignee(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {USERS.map((u) => (
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
              <SelectItem value="">(none)</SelectItem>
              {STREAMS.map((s) => (
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
            {TAGS.map((t) => (
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
        <Button variant="ghost">Cancel</Button>
        <Button>Save</Button>
      </div>
    </div>
  );
}

export default TicketEditForm;
