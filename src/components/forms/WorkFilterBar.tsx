import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search, Filter } from "lucide-react";
import * as clientsApi from "@/api/clients";
import * as projectsApi from "@/api/projects";
import * as streamsApi from "@/api/streams";
import * as usersApi from "@/api/users";
import { useEffect, useState } from "react";

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
  const [projects, setProjects] = useState<
    Array<{ id: string; name: string; code: string }>
  >([]);
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
        const { data } = await clientsApi.list({ limit: 200, offset: 0 });
        setClients(data.items.map((c) => ({ id: c.id, name: c.name })));
      } catch {
        // ignore for now
      }
    })();
  }, []);

  // Load projects when client changes
  useEffect(() => {
    if (!value.clientId) {
      setProjects([]);
      return;
    }
    (async () => {
      try {
        const { data } = await projectsApi.list({ clientId: value.clientId });
        setProjects(
          data.map((p) => ({ id: p.id, name: p.name, code: p.code }))
        );
      } catch {
        setProjects([]);
      }
    })();
  }, [value.clientId]);

  // Load streams when project changes
  useEffect(() => {
    if (!value.projectId) {
      setStreams([]);
      return;
    }
    const projectId = value.projectId;
    (async () => {
      try {
        const { data } = await streamsApi.list(projectId);
        setStreams(data.map((s) => ({ id: s.id, name: s.name })));
      } catch {
        setStreams([]);
      }
    })();
  }, [value.projectId]);

  // Load all users for assignee filter
  useEffect(() => {
    (async () => {
      try {
        const { data } = await usersApi.list({ limit: 200, offset: 0 });
        setAssignees(data.data.map((u) => ({ id: u.id, name: u.name })));
      } catch {
        setAssignees([]);
      }
    })();
  }, []);

  // Count active filters
  const activeFiltersCount =
    (value.search ? 1 : 0) +
    (value.clientId ? 1 : 0) +
    (value.projectId ? 1 : 0) +
    (value.streamId ? 1 : 0) +
    (value.assigneeId ? 1 : 0) +
    (value.priority ? 1 : 0);

  const hasFilters = activeFiltersCount > 0;

  // Get display names for active filters
  const getClientName = () =>
    clients.find((c) => c.id === value.clientId)?.name;
  const getProjectName = () =>
    projects.find((p) => p.id === value.projectId)?.name;
  const getStreamName = () =>
    streams.find((s) => s.id === value.streamId)?.name;
  const getAssigneeName = () =>
    assignees.find((a) => a.id === value.assigneeId)?.name;

  return (
    <div className="space-y-3">
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={value.search || ""}
            onChange={(e) => {
              onChange({ search: e.target.value });
              // Auto-apply on search
              if (onApply) {
                setTimeout(onApply, 300);
              }
            }}
            className="pl-10"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap gap-2">
          {/* Client Filter */}
          <Select
            value={value.clientId || "none"}
            onValueChange={(v) => {
              const newClientId = v === "none" ? undefined : v;
              onChange({
                clientId: newClientId,
                // Clear dependent filters
                projectId: undefined,
                streamId: undefined,
              });
              if (onApply) onApply();
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All Clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Project Filter - Only show if client selected or projects available */}
          {(value.clientId || projects.length > 0) && (
            <Select
              value={value.projectId || "none"}
              onValueChange={(v) => {
                const newProjectId = v === "none" ? undefined : v;
                onChange({
                  projectId: newProjectId,
                  // Clear stream when project changes
                  streamId: undefined,
                });
                if (onApply) onApply();
              }}
              disabled={!value.clientId && projects.length === 0}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Stream Filter - Only show if project selected */}
          {value.projectId && streams.length > 0 && (
            <Select
              value={value.streamId || "none"}
              onValueChange={(v) => {
                onChange({ streamId: v === "none" ? undefined : v });
                if (onApply) onApply();
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Streams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Streams</SelectItem>
                {streams.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Assignee Filter */}
          <Select
            value={value.assigneeId || "none"}
            onValueChange={(v) => {
              onChange({ assigneeId: v === "none" ? undefined : v });
              if (onApply) onApply();
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All Assignees</SelectItem>
              {assignees.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={value.priority || "none"}
            onValueChange={(v) => {
              onChange({ priority: v === "none" ? undefined : (v as any) });
              if (onApply) onApply();
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All Priorities</SelectItem>
              <SelectItem value="P0">P0 - Critical</SelectItem>
              <SelectItem value="P1">P1 - High</SelectItem>
              <SelectItem value="P2">P2 - Medium</SelectItem>
              <SelectItem value="P3">P3 - Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Button */}
          {hasFilters && (
            <Button
              variant="outline"
              size="default"
              onClick={() => {
                if (onReset) onReset();
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Active filters:</span>
          {value.clientId && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => {
                onChange({
                  clientId: undefined,
                  projectId: undefined,
                  streamId: undefined,
                });
                if (onApply) onApply();
              }}
            >
              Client: {getClientName()}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {value.projectId && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => {
                onChange({ projectId: undefined, streamId: undefined });
                if (onApply) onApply();
              }}
            >
              Project: {getProjectName()}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {value.streamId && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => {
                onChange({ streamId: undefined });
                if (onApply) onApply();
              }}
            >
              Stream: {getStreamName()}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {value.assigneeId && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => {
                onChange({ assigneeId: undefined });
                if (onApply) onApply();
              }}
            >
              Assignee: {getAssigneeName()}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {value.priority && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => {
                onChange({ priority: undefined });
                if (onApply) onApply();
              }}
            >
              Priority: {value.priority}
              <X className="w-3 h-3" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkFilterBar;
