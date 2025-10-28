import { useState } from "react";
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

type Status = "todo" | "in_progress" | "review" | "done";

const statusColumns: Array<{ id: Status; label: string; color: string }> = [
  { id: "todo", label: "To Do", color: "bg-blue-500/10" },
  { id: "in_progress", label: "In Progress", color: "bg-yellow-500/10" },
  { id: "review", label: "Review", color: "bg-purple-500/10" },
  { id: "done", label: "Completed", color: "bg-green-500/10" },
];

const mockTickets = [
  {
    id: "1",
    ticketNumber: 101,
    title: "Fix navigation menu on mobile devices",
    status: "todo" as Status,
    priority: "high" as const,
    assignee: { name: "John Doe", role: "employee" as const },
    tags: [
      { name: "bug", color: "#EF4444" },
      { name: "frontend", color: "#3B82F6" },
    ],
    commentCount: 3,
    attachmentCount: 1,
  },
  {
    id: "2",
    ticketNumber: 102,
    title: "Implement user authentication flow",
    status: "in_progress" as Status,
    priority: "urgent" as const,
    assignee: { name: "Jane Smith", role: "employee" as const },
    tags: [{ name: "feature", color: "#10B981" }],
    commentCount: 5,
    attachmentCount: 2,
  },
  {
    id: "3",
    ticketNumber: 103,
    title: "Update API documentation",
    status: "todo" as Status,
    priority: "low" as const,
    tags: [{ name: "docs", color: "#8B5CF6" }],
    commentCount: 0,
    attachmentCount: 0,
  },
  {
    id: "4",
    ticketNumber: 104,
    title: "Performance optimization for dashboard",
    status: "review" as Status,
    priority: "medium" as const,
    assignee: { name: "Bob Johnson", role: "employee" as const },
    tags: [{ name: "performance", color: "#F59E0B" }],
    commentCount: 8,
    attachmentCount: 0,
  },
  {
    id: "5",
    ticketNumber: 105,
    title: "Add export to CSV functionality",
    status: "done" as Status,
    priority: "medium" as const,
    assignee: { name: "Alice Williams", role: "employee" as const },
    tags: [{ name: "feature", color: "#10B981" }],
    commentCount: 12,
    attachmentCount: 1,
  },
];

export function Tickets() {
  const [tickets, setTickets] = useState(mockTickets);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openComment, setOpenComment] = useState(false);

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
                      #{ticket.ticketNumber}
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
