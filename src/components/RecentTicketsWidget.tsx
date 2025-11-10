import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import * as ticketsApi from "@/api/tickets";
import type { Ticket } from "@/types/api";
import { format } from "date-fns";
import { FileText } from "lucide-react";

export function RecentTicketsWidget() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentTickets() {
      setLoading(true);
      try {
        const { data } = await ticketsApi.list({ limit: 5, offset: 0 });
        setTickets(data.data);
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
          <div key={i} className="flex items-start gap-3 p-2">
            <Skeleton className="h-2 w-2 rounded-full mt-2 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
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
          <Card className="p-3 hover:bg-accent transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ticket.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {ticket.updatedAt
                    ? format(new Date(ticket.updatedAt), "MMM d, yyyy")
                    : format(new Date(ticket.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {ticket.priorityId}
              </Badge>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}

