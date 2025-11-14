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
import { Card } from "@/components/ui/card";
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
    
    // Find the current status
    const currentStatus = statuses.find((s) => s.id === ticket.statusId);
    const statusName = currentStatus?.name || ticket.statusName || "";
    const statusNameLower = statusName.toLowerCase();
    
    // Never lock tickets with "resolved" in the name, regardless of isClosed flag
    if (statusNameLower.includes("resolved")) {
      // Allow moving resolved tickets
    } else {
      // Check if status is closed (either by flag or name)
      const isClosed = currentStatus?.isClosed || statusNameLower.includes("closed");
      
      if (isClosed) {
        return;
      }
    }
    
    onMoveTicket?.(ticketId, toStatusId);
  }

  const getGridColumns = () => {
    const count = statuses.length;
    // On mobile, show 1 column if more than 3 statuses, otherwise show all
    // On tablet, show 2-3 columns max
    // On desktop, show all columns
    if (count <= 2) return `repeat(${count}, minmax(0, 1fr))`;
    if (count === 3) return "repeat(auto-fit, minmax(200px, 1fr))";
    return "repeat(auto-fit, minmax(180px, 1fr))";
  };

  return (
    <div
      className="w-full h-[calc(100vh-280px)] min-h-[400px] max-h-[800px] overflow-x-auto"
      style={{
        display: "grid",
        gridTemplateColumns: getGridColumns(),
        gap: "clamp(0.5rem, 2vw, 0.75rem)",
        padding: "clamp(0.25rem, 1vw, 0.5rem)",
      }}
    >
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
              {ticketsByStatus.get(status.id)?.map((t) => {
                const currentStatus = statuses.find((s) => s.id === t.statusId);
                // Only lock tickets that are specifically in "Closed" status (but not resolved)
                const statusName = currentStatus?.name || t.statusName || "";
                const statusNameLower = statusName.toLowerCase();
                
                // Never lock tickets with "resolved" in the name, regardless of isClosed flag
                const isClosedTicket = statusNameLower.includes("resolved") 
                  ? false 
                  : (currentStatus?.isClosed || statusNameLower.includes("closed"));
                
                return (
                  <DraggableCard
                    key={t.id}
                    id={t.id}
                    ticket={t}
                    onClick={() => onCardClick?.(t.id)}
                    onEdit={() => onEditTicket?.(t.id)}
                    isLocked={isClosedTicket}
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
                            <DropdownMenuItem
                              onClick={() => onEditTicket?.(t.id)}
                            >
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
                );
              })}
            </div>
          </Column>
        ))}
        <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
          {activeId ? (
            <Card className="pointer-events-none w-full max-w-[300px] p-3 shadow-xl">
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
      ring: "ring-gray-300/50 dark:ring-gray-600/50",
      header: "text-gray-700 dark:text-gray-300",
      tint: "bg-gradient-to-b from-gray-50/80 to-gray-100/40 dark:from-gray-800/30 dark:to-gray-900/40 border-gray-200/60 dark:border-gray-700/60",
      dot: "bg-gray-400 dark:bg-gray-500",
    };
  if (key.includes("todo") || key.includes("to do"))
    return {
      ring: "ring-indigo-300/50 dark:ring-indigo-600/50",
      header: "text-indigo-700 dark:text-indigo-300",
      tint: "bg-gradient-to-b from-indigo-50/80 to-indigo-100/40 dark:from-indigo-950/30 dark:to-indigo-900/40 border-indigo-200/60 dark:border-indigo-800/60",
      dot: "bg-indigo-500 dark:bg-indigo-400",
    };
  if (key.includes("progress"))
    return {
      ring: "ring-sky-300/50 dark:ring-sky-600/50",
      header: "text-sky-700 dark:text-sky-300",
      tint: "bg-gradient-to-b from-sky-50/80 to-sky-100/40 dark:from-sky-950/30 dark:to-sky-900/40 border-sky-200/60 dark:border-sky-800/60",
      dot: "bg-sky-500 dark:bg-sky-400",
    };
  if (key.includes("review") || key.includes("qa"))
    return {
      ring: "ring-purple-300/50 dark:ring-purple-600/50",
      header: "text-purple-700 dark:text-purple-300",
      tint: "bg-gradient-to-b from-purple-50/80 to-purple-100/40 dark:from-purple-950/30 dark:to-purple-900/40 border-purple-200/60 dark:border-purple-800/60",
      dot: "bg-purple-500 dark:bg-purple-400",
    };
  if (key.includes("done") || status.isClosed)
    return {
      ring: "ring-emerald-300/50 dark:ring-emerald-600/50",
      header: "text-emerald-700 dark:text-emerald-300",
      tint: "bg-gradient-to-b from-emerald-50/80 to-emerald-100/40 dark:from-emerald-950/30 dark:to-emerald-900/40 border-emerald-200/60 dark:border-emerald-800/60",
      dot: "bg-emerald-500 dark:bg-emerald-400",
    };
  if (key.includes("cancel"))
    return {
      ring: "ring-red-300/50 dark:ring-red-600/50",
      header: "text-red-700 dark:text-red-300",
      tint: "bg-gradient-to-b from-red-50/80 to-red-100/40 dark:from-red-950/30 dark:to-red-900/40 border-red-200/60 dark:border-red-800/60",
      dot: "bg-red-500 dark:bg-red-400",
    };
  return {
    ring: "ring-slate-300/50 dark:ring-slate-600/50",
    header: "text-slate-700 dark:text-slate-300",
    tint: "bg-gradient-to-b from-slate-50/80 to-slate-100/40 dark:from-slate-800/30 dark:to-slate-900/40 border-slate-200/60 dark:border-slate-700/60",
    dot: "bg-slate-400 dark:bg-slate-500",
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
    <div className="flex flex-col min-w-0 h-full">
      <div className="sticky top-0 z-10 mb-2 flex items-center justify-between px-3 py-2.5 rounded-lg bg-background/95 backdrop-blur-sm shadow-sm border border-border/40">
        <div
          className={cn(
            "text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 min-w-0",
            colors.header
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full flex-shrink-0 shadow-sm",
              colors.dot
            )}
          />
          <span className="truncate">{title}</span>
        </div>
        <div className="rounded-full bg-muted/80 px-2 sm:px-2.5 py-0.5 text-xs font-medium text-muted-foreground flex-shrink-0 min-w-[24px] text-center">
          {count}
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-lg border p-1.5 sm:p-2 transition-all overflow-y-auto min-h-0 shadow-sm",
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
  isLocked = false,
  children,
}: {
  id: string;
  ticket: TicketListItem;
  onClick?: () => void;
  onEdit?: () => void;
  isLocked?: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ 
      id,
      disabled: isLocked, // Disable dragging for locked (closed) tickets
    });
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
            "select-none p-2 sm:p-3 transition-all duration-200 will-change-transform bg-card/80 backdrop-blur-sm border-border/60",
            isLocked 
              ? "cursor-default opacity-75" 
              : "cursor-grab active:cursor-grabbing",
            isDragging
              ? "z-50 shadow-2xl scale-[1.02] ring-2 ring-primary/20"
              : "hover:shadow-md hover:border-border hover:-translate-y-0.5"
          )}
          onClick={handleClick}
          {...(isLocked ? {} : listeners)}
          {...attributes}
        >
          {children}
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 hidden sm:block">
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
