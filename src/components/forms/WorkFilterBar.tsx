import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import * as clientsApi from "@/api/clients";
import * as projectsApi from "@/api/projects";
import * as streamsApi from "@/api/streams";
import * as usersApi from "@/api/users";
import { useEffect, useMemo, useState } from "react";

type FilterValues = {
  search?: string;
  clientId?: string;
  projectId?: string;
  streamId?: string;
  status?: string[];
  assigneeId?: string;
  tagIds?: string[];
  priority?: "P0" | "P1" | "P2" | "P3";
  type?: "TASK" | "BUG" | "STORY" | "EPIC";
};

interface WorkFilterBarProps {
  value: FilterValues;
  onChange: (patch: Partial<FilterValues>) => void;
  onApply?: () => void;
  onReset?: () => void;
}

export function WorkFilterBar({
  value,
  onChange,
  onApply,
  onReset,
}: WorkFilterBarProps) {
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [streams, setStreams] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [assignees, setAssignees] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Load clients once
  useEffect(() => {
    (async () => {
      try {
        const { data } = await clientsApi.list({ limit: 100, offset: 0 });
        setClients(data.items.map((c) => ({ id: c.id, name: c.name })));
      } catch {
        // ignore for now
      }
    })();
  }, []);

  // Load projects when client changes
  useEffect(() => {
    (async () => {
      if (!value.clientId) {
        setProjects([]);
        return;
      }
      try {
        const { data } = await projectsApi.list({ clientId: value.clientId });
        setProjects(data.map((p) => ({ id: p.id, name: p.name })));
      } catch {
        setProjects([]);
      }
    })();
  }, [value.clientId]);

  // Load streams when project changes
  useEffect(() => {
    (async () => {
      if (!value.projectId) {
        setStreams([]);
        return;
      }
      try {
        const { data } = await streamsApi.list(value.projectId);
        setStreams(data.map((s) => ({ id: s.id, name: s.name })));
      } catch {
        setStreams([]);
      }
    })();
  }, [value.projectId]);

  // Load assignable users when client changes
  useEffect(() => {
    (async () => {
      if (!value.clientId) {
        setAssignees([]);
        return;
      }
      try {
        const { data } = await usersApi.assignableUsers(value.clientId);
        setAssignees(data.map((u) => ({ id: u.id, name: u.name })));
      } catch {
        setAssignees([]);
      }
    })();
  }, [value.clientId]);

  // Tags support can be added later (multi-select UI)

  const statusDisplay = useMemo(
    () => (value.status && value.status[0]) || "",
    [value.status]
  );

  return (
    <div className="flex gap-3 items-center overflow-x-auto py-2 px-1">
      <div className="min-w-[220px]">
        <Input
          placeholder="Search or press Cmd+K"
          value={value.search || ""}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>
      <div className="min-w-[160px]">
        <Select
          value={value.clientId}
          onValueChange={(v) =>
            onChange({
              clientId: v || undefined,
              projectId: undefined,
              streamId: undefined,
              assigneeId: undefined,
              tagIds: undefined,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Client" />
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
      <div className="min-w-[160px]">
        <Select
          value={value.projectId}
          onValueChange={(v) =>
            onChange({ projectId: v || undefined, streamId: undefined })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Project" />
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
      <div className="min-w-[140px]">
        <Select
          value={value.streamId}
          onValueChange={(v) => onChange({ streamId: v || undefined })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Stream" />
          </SelectTrigger>
          <SelectContent>
            {streams.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[140px]">
        <Select
          value={statusDisplay}
          onValueChange={(v) => onChange({ status: v ? [v] : undefined })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {[
              "BACKLOG",
              "TODO",
              "IN_PROGRESS",
              "REVIEW",
              "DONE",
              "CANCELLED",
            ].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[160px]">
        <Select
          value={value.assigneeId}
          onValueChange={(v) => onChange({ assigneeId: v || undefined })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            {assignees.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Tags multi-select can be added later; keeping placeholder minimal */}
      <div className="min-w-[120px]">
        <Select
          value={value.priority}
          onValueChange={(v) => onChange({ priority: (v as any) || undefined })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {["P0", "P1", "P2", "P3"].map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[120px]">
        <Select
          value={value.type}
          onValueChange={(v) => onChange({ type: (v as any) || undefined })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {["TASK", "BUG", "STORY", "EPIC"].map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" onClick={onReset}>
          Reset
        </Button>
        <Button onClick={onApply}>Apply</Button>
      </div>
    </div>
  );
}

export default WorkFilterBar;
