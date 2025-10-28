import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LayoutGrid, List, Calendar, Users } from "lucide-react";
import { TicketCard } from "@/components/TicketCard";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TicketCreateForm } from "@/components/forms/TicketCreateForm";
import { TicketEditForm } from "@/components/forms/TicketEditForm";
import { CommentForm } from "@/components/forms/CommentForm";
import * as ticketsApi from "@/api/tickets";
import { WorkFilterBar } from "@/components/forms/WorkFilterBar";
import { useSearchParams } from "react-router-dom";

type Status = "todo" | "in_progress" | "review" | "done";

const statusColumns: Array<{ id: Status; label: string; color: string }> = [
  { id: "todo", label: "To Do", color: "bg-blue-500/10" },
  { id: "in_progress", label: "In Progress", color: "bg-yellow-500/10" },
  { id: "review", label: "Review", color: "bg-purple-500/10" },
  { id: "done", label: "Completed", color: "bg-green-500/10" },
];

type UITicket = {
  id: string;
  ticketNumber: number;
  title: string;
  status: Status;
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: { name: string; role: "employee" | "client" | "admin" } | null;
  tags?: Array<{ name: string; color: string }>;
  commentCount?: number;
  attachmentCount?: number;
};

export function Tickets() {
  const [tickets, setTickets] = useState<UITicket[]>([]);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

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

  const parseParams = (): FilterValues & { limit: number; offset: number } => {
    const sp = searchParams;
    const get = (k: string) => sp.get(k) || undefined;
    const toArray = (k: string) => {
      const v = sp.get(k);
      if (!v) return undefined;
      return v.split(",").filter(Boolean);
    };
    const parsedLimit = Number(get("limit")) || 20;
    const parsedOffset = Number(get("offset")) || 0;
    return {
      search: get("search"),
      clientId: get("clientId"),
      projectId: get("projectId"),
      streamId: get("streamId"),
      status: toArray("status"),
      assigneeId: get("assigneeId"),
      tagIds: toArray("tagIds"),
      // keep priority/type in URL for future server support
      priority: (get("priority") as any) || undefined,
      type: (get("type") as any) || undefined,
      limit: parsedLimit,
      offset: parsedOffset,
    };
  };

  const [filters, setFilters] = useState<FilterValues>(() => parseParams());
  const currentLimit = useMemo(
    () => Number(searchParams.get("limit")) || limit,
    [searchParams, limit]
  );
  const currentOffset = useMemo(
    () => Number(searchParams.get("offset")) || offset,
    [searchParams, offset]
  );
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(count / limit));

  // keep filters in sync with URL changes (back/forward)
  useEffect(() => {
    const parsed = parseParams();
    setFilters(parsed);
    // also keep local paging in sync
    setOffset(parsed.offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // fetch when paging or filters change (based on URL)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Build query only with API-supported keys
        const query: any = {
          limit: currentLimit,
          offset: currentOffset,
        };
        if (filters.search) query.search = filters.search;
        if (filters.clientId) query.clientId = filters.clientId;
        if (filters.projectId) query.projectId = filters.projectId;
        if (filters.streamId) query.streamId = filters.streamId;
        if (filters.assigneeId) query.assigneeId = filters.assigneeId;
        if (filters.status && filters.status.length)
          query.status = filters.status;
        if (filters.tagIds && filters.tagIds.length)
          query.tagIds = filters.tagIds;
        const { data } = await ticketsApi.pagedList(query);
        setCount(data.count);
        const mapped: UITicket[] = data.items.map((t, idx) => ({
          id: t.id,
          title: t.title,
          ticketNumber: idx + 1 + offset,
          priority: "medium",
          status:
            t.status === "TODO"
              ? "todo"
              : t.status === "IN_PROGRESS"
                ? "in_progress"
                : t.status === "REVIEW"
                  ? "review"
                  : t.status === "DONE" || t.status === "CANCELLED"
                    ? "done"
                    : // BACKLOG and anything else fall back to TODO column
                      "todo",
        }));
        setTickets(mapped);
      } finally {
        setLoading(false);
      }
    })();
  }, [
    currentLimit,
    currentOffset,
    filters.search,
    filters.clientId,
    filters.projectId,
    filters.streamId,
    filters.assigneeId,
    JSON.stringify(filters.status),
    JSON.stringify(filters.tagIds),
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const ticketId = active.id as string;
      const newStatus = over.id as Status;

      setTickets((tickets) =>
        tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
    }

    setActiveId(null);
  };

  const activeTicket = tickets.find((t) => t.id === activeId);

  // Draggable ticket wrapper
  function DraggableTicket({
    id,
    children,
  }: {
    id: string;
    children: React.ReactNode;
  }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({ id });
    const style = transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined;
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={cn(
          "touch-none select-none",
          isDragging ? "opacity-60" : "opacity-100"
        )}
      >
        {children}
      </div>
    );
  }

  // Droppable column wrapper
  function DroppableColumn({
    id,
    children,
  }: {
    id: Status;
    children: React.ReactNode;
  }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
      <div
        ref={setNodeRef}
        className={cn(isOver && "ring-2 ring-primary/30 rounded-xl")}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
            Tickets
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage and track all your tickets
          </p>
        </div>
        <div className="flex justify-start md:justify-end gap-2">
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <TicketCreateForm />
            </DialogContent>
          </Dialog>

          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hidden md:inline-flex">
                Quick Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <TicketEditForm />
            </DialogContent>
          </Dialog>

          <Dialog open={openComment} onOpenChange={setOpenComment}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hidden md:inline-flex">
                Add Comment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Add Comment</h2>
                <CommentForm />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <WorkFilterBar
        value={filters}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onApply={() => {
          const sp = new URLSearchParams();
          if (filters.search) sp.set("search", filters.search);
          if (filters.clientId) sp.set("clientId", filters.clientId);
          if (filters.projectId) sp.set("projectId", filters.projectId);
          if (filters.streamId) sp.set("streamId", filters.streamId);
          if (filters.assigneeId) sp.set("assigneeId", filters.assigneeId);
          if (filters.status && filters.status.length)
            sp.set("status", filters.status.join(","));
          if (filters.tagIds && filters.tagIds.length)
            sp.set("tagIds", filters.tagIds.join(","));
          if (filters.priority) sp.set("priority", filters.priority);
          if (filters.type) sp.set("type", filters.type);
          sp.set("limit", String(limit));
          sp.set("offset", "0");
          setSearchParams(sp, { replace: false });
        }}
        onReset={() => {
          setFilters({});
          const sp = new URLSearchParams();
          sp.set("limit", String(limit));
          sp.set("offset", "0");
          setSearchParams(sp, { replace: false });
        }}
      />

      <Tabs defaultValue="kanban" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="min-w-max">
            <TabsTrigger value="kanban">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="w-4 h-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="assignee">
              <Users className="w-4 h-4 mr-2" />
              By Assignee
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="space-y-4">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3 sm:gap-4 overflow-x-auto md:overflow-visible pb-4 snap-x snap-mandatory md:snap-none">
              {statusColumns.map((column) => {
                const columnTickets = tickets.filter(
                  (t) => t.status === column.id
                );

                return (
                  <DroppableColumn key={column.id} id={column.id}>
                    <div className="snap-start shrink-0 md:shrink w-[16rem] sm:w-[18rem] md:w-auto md:flex-1 md:basis-1/4 md:min-w-0 bg-card rounded-xl border border-border">
                      <div
                        className={cn(
                          "p-3 border-b border-border",
                          column.color
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">
                            {column.label}
                          </h3>
                          <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                            {columnTickets.length}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 space-y-3 min-h-[320px] sm:min-h-[380px] md:min-h-[400px]">
                        {columnTickets.map((ticket) => (
                          <DraggableTicket key={ticket.id} id={ticket.id}>
                            <TicketCard
                              {...ticket}
                              className="cursor-grab active:cursor-grabbing select-none"
                            />
                          </DraggableTicket>
                        ))}
                      </div>
                    </div>
                  </DroppableColumn>
                );
              })}
            </div>

            <DragOverlay>
              {activeTicket ? (
                <div className="rotate-3">
                  <TicketCard {...activeTicket} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        <TabsContent value="list">
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="min-w-[640px] w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    ID
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Priority
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Assignee
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-border hover:bg-accent/50 cursor-pointer"
                  >
                    <td className="p-3 text-sm text-muted-foreground font-mono">
                      {ticket.ticketNumber ? `#${ticket.ticketNumber}` : "—"}
                    </td>
                    <td className="p-3 text-sm text-foreground font-medium">
                      {ticket.title}
                    </td>
                    <td className="p-3">
                      {/* StatusBadge component would go here */}
                    </td>
                    <td className="p-3">
                      {/* PriorityBadge component would go here */}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {ticket.assignee?.name || "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-3">
              <div className="text-sm text-muted-foreground">
                {count} total • Page {page}/{totalPages}{" "}
                {loading ? "• Loading…" : ""}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={loading || offset === 0}
                  onClick={() => {
                    const newOffset = Math.max(0, offset - limit);
                    setOffset(newOffset);
                    const sp = new URLSearchParams(searchParams);
                    sp.set("limit", String(limit));
                    sp.set("offset", String(newOffset));
                    setSearchParams(sp, { replace: false });
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={loading || page >= totalPages}
                  onClick={() => {
                    const newOffset = offset + limit;
                    setOffset(newOffset);
                    const sp = new URLSearchParams(searchParams);
                    sp.set("limit", String(limit));
                    sp.set("offset", String(newOffset));
                    setSearchParams(sp, { replace: false });
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Calendar view coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="assignee">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Assignee view coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
