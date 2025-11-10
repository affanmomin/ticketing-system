import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { MoreVertical, User, Calendar, Building2 } from "lucide-react";
import type { Status, Ticket } from "@/types/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export type TicketListItem = Ticket & {
  priorityName?: string;
  statusName?: string;
  clientName?: string;
  projectName?: string;
};

interface TicketsBoardProps {
  tickets: ReadonlyArray<TicketListItem>;
  statuses: ReadonlyArray<Status>;
  loading?: boolean;
  onCardClick?: (ticketId: string) => void;
  onMoveTicket?: (ticketId: string, toStatusId: string) => void | Promise<void>;
  onEditTicket?: (ticketId: string) => void;
}

export function TicketsBoard({
  tickets,
  statuses,
  loading = false,
  onCardClick,
  onMoveTicket,
  onEditTicket,
}: TicketsBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const ticketsByStatus = useMemo(() => {
    const map = new Map<string, TicketListItem[]>();
    statuses.forEach((s) => map.set(s.id, []));
    tickets.forEach((t) => {
      if (!map.has(t.statusId)) map.set(t.statusId, []);
      map.get(t.statusId)!.push(t);
    });
    return map;
  }, [tickets, statuses]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const ticketId = String(active.id);
    const toStatusId = String(over.id);
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.statusId === toStatusId) return;
    onMoveTicket?.(ticketId, toStatusId);
  }

  return (
    <div className="flex h-[70vh] min-h-[420px] w-full gap-4 pb-2 px-1 sm:px-2 flex-col md:flex-row md:overflow-x-auto md:snap-x md:snap-mandatory md:touch-pan-x">
      <DndContext
        sensors={sensors}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        {statuses.map((status) => (
          <Column
            key={status.id}
            id={status.id}
            status={status}
            title={status.name}
            count={ticketsByStatus.get(status.id)?.length ?? 0}
            loading={loading}
          >
            <div className="space-y-2">
              {ticketsByStatus.get(status.id)?.map((t) => (
                <DraggableCard
                  key={t.id}
                  id={t.id}
                  ticket={t}
                  onClick={() => onCardClick?.(t.id)}
                  onEdit={() => onEditTicket?.(t.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {t.id.substring(0, 8)}
                    </span>
                    <div className="flex items-center gap-1">
                      {t.priorityName && (
                        <Badge variant="secondary" className="h-5 px-2 text-xs">
                          {t.priorityName}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditTicket?.(t.id)}>
                            Edit Ticket
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onCardClick?.(t.id)}>
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1 line-clamp-2">
                    {t.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {t.projectName ?? t.projectId}
                    {t.clientName ? ` • ${t.clientName}` : ""}
                  </div>
                </DraggableCard>
              ))}
            </div>
          </Column>
        ))}
        <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
          {activeId ? (
            <Card className="pointer-events-none w-[300px] p-3 shadow-xl">
              <div className="h-4 w-24 rounded bg-muted mb-2" />
              <div className="h-3 w-full rounded bg-muted mb-1" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function statusColor(status: Status) {
  const key = status.name.toLowerCase();
  if (key.includes("backlog"))
    return {
      ring: "ring-slate-400/40",
      header: "text-slate-700 dark:text-slate-300",
      tint: "bg-slate-50 dark:bg-slate-900/40",
      dot: "bg-slate-500",
    };
  if (key.includes("todo") || key.includes("to do"))
    return {
      ring: "ring-blue-400/40",
      header: "text-blue-700 dark:text-blue-300",
      tint: "bg-blue-50 dark:bg-blue-900/30",
      dot: "bg-blue-500",
    };
  if (key.includes("progress"))
    return {
      ring: "ring-amber-400/40",
      header: "text-amber-700 dark:text-amber-300",
      tint: "bg-amber-50 dark:bg-amber-900/30",
      dot: "bg-amber-500",
    };
  if (key.includes("review") || key.includes("qa"))
    return {
      ring: "ring-violet-400/40",
      header: "text-violet-700 dark:text-violet-300",
      tint: "bg-violet-50 dark:bg-violet-900/30",
      dot: "bg-violet-500",
    };
  if (key.includes("done") || status.isClosed)
    return {
      ring: "ring-emerald-400/40",
      header: "text-emerald-700 dark:text-emerald-300",
      tint: "bg-emerald-50 dark:bg-emerald-900/30",
      dot: "bg-emerald-500",
    };
  if (key.includes("cancel"))
    return {
      ring: "ring-rose-400/40",
      header: "text-rose-700 dark:text-rose-300",
      tint: "bg-rose-50 dark:bg-rose-900/30",
      dot: "bg-rose-500",
    };
  return {
    ring: "ring-muted/40",
    header: "text-foreground",
    tint: "bg-muted/20",
    dot: "bg-muted-foreground",
  };
}

function Column({
  id,
  status,
  title,
  count,
  children,
  loading,
}: {
  id: string;
  status: Status;
  title: string;
  count: number;
  children: React.ReactNode;
  loading?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const colors = statusColor(status);
  return (
    <div className="flex flex-col w-full md:w-[320px] md:flex-shrink-0 md:snap-start">
      <div className="sticky top-0 z-10 mb-2 flex items-center justify-between px-2 py-2 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div
          className={cn(
            "text-sm font-medium flex items-center gap-2",
            colors.header
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", colors.dot)} />
          {title}
        </div>
        <div className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[280px] md:min-h-[320px] flex-1 rounded-lg border border-border p-2 transition-all overflow-y-auto",
          colors.tint,
          isOver && cn("ring-2", colors.ring)
        )}
      >
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[84px] animate-pulse rounded-lg border border-border/60 bg-muted"
              />
            ))}
          </div>
        )}
        {!loading && children}
      </div>
    </div>
  );
}

function DraggableCard({
  id,
  ticket,
  onClick,
  onEdit,
  children,
}: {
  id: string;
  ticket: TicketListItem;
  onClick?: () => void;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : {};

  const handleClick = () => {
    // Clicks should work - dnd-kit PointerSensor with distance constraint allows it
    onClick?.();
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card
          ref={setNodeRef}
          style={style}
          className={cn(
            "cursor-grab select-none p-3 active:cursor-grabbing transition-transform duration-200 will-change-transform",
            isDragging ? "z-50 shadow-xl scale-[1.02]" : "hover:shadow-sm"
          )}
          onClick={handleClick}
          {...listeners}
          {...attributes}
        >
          {children}
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold mb-1">{ticket.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {ticket.descriptionMd || "No description"}
            </p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Project:</span>
              <span>{ticket.projectName || ticket.projectId}</span>
            </div>
            {ticket.clientName && (
              <div className="flex items-center gap-2">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Client:</span>
                <span>{ticket.clientName}</span>
              </div>
            )}
            {ticket.assignedToUserId && (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Assigned to:</span>
                <span>{ticket.assignedToUserId}</span>
              </div>
            )}
            {ticket.updatedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span>{format(new Date(ticket.updatedAt), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              View
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
