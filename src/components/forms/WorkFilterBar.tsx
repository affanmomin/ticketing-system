import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Label and Separator intentionally unused in this static bar
import { Button } from "@/components/ui/button";
import { useState } from "react";

const _STATUS = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "CANCELLED",
];
const _CLIENTS = [
  { id: "c1", name: "Acme Co" },
  { id: "c2", name: "Globex" },
];
const _PROJECTS = [
  { id: "p1", name: "Website", code: "ACM" },
  { id: "p2", name: "Mobile", code: "MOB" },
];
const _STREAMS = [
  { id: "s1", name: "Frontend" },
  { id: "s2", name: "Backend" },
];
const _USERS = [
  { id: "u1", name: "Dev One" },
  { id: "u2", name: "Dev Two" },
];
const _TAGS = [
  { id: "t1", name: "urgent", color: "#ef4444" },
  { id: "t2", name: "ux", color: "#8b5cf6" },
];

// reference to avoid unused var eslint/ts warnings
void _TAGS;

export function WorkFilterBar() {
  const [q, setQ] = useState("");
  return (
    <div className="flex gap-3 items-center overflow-x-auto py-2 px-1">
      <div className="min-w-[220px]">
        <Input
          placeholder="Search or press Cmd+K"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="min-w-[160px]">
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            {_CLIENTS.map((c: { id: string; name: string }) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[160px]">
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            {_PROJECTS.map((p: { id: string; name: string }) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[140px]">
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Stream" />
          </SelectTrigger>
          <SelectContent>
            {_STREAMS.map((s: { id: string; name: string }) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[160px]">
        <input className="input w-full" placeholder="Status (multi)" />
      </div>
      <div className="min-w-[160px]">
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            {_USERS.map((u: { id: string; name: string }) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[160px]">
        <input className="input w-full" placeholder="Tags (multi)" />
      </div>
      <div className="min-w-[120px]">
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="P0">P0</SelectItem>
            <SelectItem value="P1">P1</SelectItem>
            <SelectItem value="P2">P2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[120px]">
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TASK">TASK</SelectItem>
            <SelectItem value="BUG">BUG</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost">Reset</Button>
        <Button>Apply</Button>
      </div>
    </div>
  );
}

export default WorkFilterBar;

// keep _STATUS available as a static placeholder
void _STATUS;
