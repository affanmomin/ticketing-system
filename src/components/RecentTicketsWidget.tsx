import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import * as ticketsApi from "@/api/tickets";
import type { Ticket } from "@/types/api";
import { format } from "date-fns";
import { FileText, User, UserCheck } from "lucide-react";

export function RecentTicketsWidget() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentTickets() {
      setLoading(true);
      try {
        const { data: ticketsData } = await ticketsApi.list({ limit: 5, offset: 0 });
        setTickets(ticketsData.data);
      } catch (error) {
        console.warn("Failed to load recent tickets", error);
      } finally {
        setLoading(false);
      }
    }
    loadRecentTickets();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 border rounded-lg">
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-24" />
              <div className="flex items-center gap-4 mt-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs text-muted-foreground">No tickets yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          onClick={() => navigate(`/tickets?ticketId=${ticket.id}`)}
          className="w-full text-left"
        >
          <Card className="p-3 hover:bg-accent/50 transition-all hover:shadow-sm border-border/60">
            <div className="space-y-2.5">
              {/* Ticket Title */}
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium line-clamp-2 flex-1 min-w-0">
                  {ticket.title}
                </h4>
                <Badge variant="secondary" className="text-xs shrink-0 h-5">
                  {ticket.priorityName || ticket.priorityId}
                </Badge>
              </div>

              {/* Date */}
              <p className="text-xs text-muted-foreground">
                {ticket.updatedAt
                  ? format(new Date(ticket.updatedAt), "MMM d, yyyy 'at' h:mm a")
                  : format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>

              {/* Raised By and Assigned To */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-1 border-t border-border/40">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                  <User className="h-3 w-3 shrink-0" />
                  <span className="shrink-0">Raised by:</span>
                  <span className="font-medium text-foreground truncate">
                    {ticket.raisedByName || ticket.raisedByEmail || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                  <UserCheck className="h-3 w-3 shrink-0" />
                  <span className="shrink-0">Assigned:</span>
                  <span className={`font-medium truncate ${ticket.assignedToUserId ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                    {ticket.assignedToName || ticket.assignedToEmail || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}

