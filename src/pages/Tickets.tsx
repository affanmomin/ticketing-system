import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutGrid, List, Calendar, Users } from 'lucide-react';
import { TicketCard } from '@/components/TicketCard';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { cn } from '@/lib/utils';

type Status = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';

const statusColumns: Array<{ id: Status; label: string; color: string }> = [
  { id: 'backlog', label: 'Backlog', color: 'bg-gray-500/10' },
  { id: 'todo', label: 'To Do', color: 'bg-blue-500/10' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-yellow-500/10' },
  { id: 'review', label: 'Review', color: 'bg-purple-500/10' },
  { id: 'done', label: 'Done', color: 'bg-green-500/10' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-500/10' },
];

const mockTickets = [
  {
    id: '1',
    ticketNumber: 101,
    title: 'Fix navigation menu on mobile devices',
    status: 'todo' as Status,
    priority: 'high' as const,
    assignee: { name: 'John Doe', role: 'employee' as const },
    tags: [
      { name: 'bug', color: '#EF4444' },
      { name: 'frontend', color: '#3B82F6' },
    ],
    commentCount: 3,
    attachmentCount: 1,
  },
  {
    id: '2',
    ticketNumber: 102,
    title: 'Implement user authentication flow',
    status: 'in_progress' as Status,
    priority: 'urgent' as const,
    assignee: { name: 'Jane Smith', role: 'employee' as const },
    tags: [{ name: 'feature', color: '#10B981' }],
    commentCount: 5,
    attachmentCount: 2,
  },
  {
    id: '3',
    ticketNumber: 103,
    title: 'Update API documentation',
    status: 'backlog' as Status,
    priority: 'low' as const,
    tags: [{ name: 'docs', color: '#8B5CF6' }],
    commentCount: 0,
    attachmentCount: 0,
  },
  {
    id: '4',
    ticketNumber: 104,
    title: 'Performance optimization for dashboard',
    status: 'review' as Status,
    priority: 'medium' as const,
    assignee: { name: 'Bob Johnson', role: 'employee' as const },
    tags: [{ name: 'performance', color: '#F59E0B' }],
    commentCount: 8,
    attachmentCount: 0,
  },
  {
    id: '5',
    ticketNumber: 105,
    title: 'Add export to CSV functionality',
    status: 'done' as Status,
    priority: 'medium' as const,
    assignee: { name: 'Alice Williams', role: 'employee' as const },
    tags: [{ name: 'feature', color: '#10B981' }],
    commentCount: 12,
    attachmentCount: 1,
  },
];

export function Tickets() {
  const [tickets, setTickets] = useState(mockTickets);
  const [activeId, setActiveId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your tickets</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
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

        <TabsContent value="kanban" className="space-y-4">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {statusColumns.map((column) => {
                const columnTickets = tickets.filter((t) => t.status === column.id);

                return (
                  <div
                    key={column.id}
                    className="flex-shrink-0 w-80 bg-card rounded-xl border border-border"
                  >
                    <div className={cn('p-3 border-b border-border', column.color)}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{column.label}</h3>
                        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                          {columnTickets.length}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 space-y-3 min-h-[400px]">
                      {columnTickets.map((ticket) => (
                        <div key={ticket.id} id={ticket.id}>
                          <TicketCard {...ticket} />
                        </div>
                      ))}
                    </div>
                  </div>
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
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">ID</th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Title</th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Priority</th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Assignee</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border hover:bg-accent/50 cursor-pointer">
                    <td className="p-3 text-sm text-muted-foreground font-mono">#{ticket.ticketNumber}</td>
                    <td className="p-3 text-sm text-foreground font-medium">{ticket.title}</td>
                    <td className="p-3">{/* StatusBadge component would go here */}</td>
                    <td className="p-3">{/* PriorityBadge component would go here */}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {ticket.assignee?.name || 'Unassigned'}
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
