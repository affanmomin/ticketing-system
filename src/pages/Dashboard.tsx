import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderKanban, Users, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { RecentTicketsWidget } from "@/components/RecentTicketsWidget";
import * as ticketsApi from "@/api/tickets";
import * as projectsApi from "@/api/projects";
import * as usersApi from "@/api/users";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { toast } from "@/hooks/use-toast";

export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { statuses } = useTaxonomy();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTickets: 0,
    activeProjects: 0,
    totalUsers: 0,
    completedTickets: 0,
  });

  const role =
    (user?.role?.toLowerCase?.() as
      | "admin"
      | "employee"
      | "client"
      | undefined) ?? "admin";
  const firstName = user?.fullName || "User";

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [ticketsRes, projectsRes, usersRes] = await Promise.all([
          ticketsApi.list({ limit: 1, offset: 0 }),
          projectsApi.list({ limit: 1, offset: 0, active: true }),
          user?.role === "ADMIN" ? usersApi.list({ limit: 1, offset: 0 }) : Promise.resolve(null),
        ]);

        const totalTickets = ticketsRes.data.total;
        const activeProjects = projectsRes.data.total;
        const totalUsers = usersRes?.data.total || 0;

        // Get completed tickets count
        const closedStatuses = statuses.filter((s) => s.isClosed);
        const closedStatusIds = closedStatuses.map((s) => s.id);
        let completedTickets = 0;
        if (closedStatusIds.length > 0) {
          try {
            const completedRes = await ticketsApi.list({
              limit: 1,
              offset: 0,
              statusId: closedStatusIds[0],
            });
            completedTickets = completedRes.data.total;
          } catch (error) {
            // If filtering by status fails, estimate from total
            completedTickets = Math.floor(totalTickets * 0.2); // Rough estimate
          }
        }

        setStats({
          totalTickets,
          activeProjects,
          totalUsers,
          completedTickets,
        });
      } catch (error: any) {
        console.error("Failed to load dashboard:", error);
        toast({
          title: "Failed to load dashboard",
          description: error?.response?.data?.message || "Unexpected error",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user?.role, statuses]);

  const statsData = [
    {
      title: "Total Tickets",
      value: stats.totalTickets.toLocaleString(),
      icon: <FileText className="w-5 h-5" />,
      change: "+0%",
      changeSummary: "from last month",
      onClick: () => navigate("/tickets"),
    },
    {
      title: "Active Projects",
      value: stats.activeProjects.toLocaleString(),
      icon: <FolderKanban className="w-5 h-5" />,
      change: "+0",
      changeSummary: "from last month",
      onClick: () => navigate("/projects"),
    },
    {
      title: role === "admin" ? "Total Users" : "Team Members",
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      change: "+0",
      changeSummary: "from last month",
      onClick: () => role === "admin" && navigate("/users"),
    },
    {
      title: "Completed",
      value: stats.completedTickets.toLocaleString(),
      icon: <CheckCircle2 className="w-5 h-5" />,
      change: "+0",
      changeSummary: "from last month",
      onClick: () => navigate("/tickets"),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`Here's what's happening with your ${role === "client" ? "projects" : "workspace"} today.`}
      />

      {loading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-3 sm:h-4 w-20 sm:w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-8 sm:h-9 sm:w-9 bg-muted animate-pulse rounded-md" />
              </CardHeader>
              <CardContent>
                <div className="h-7 sm:h-8 w-12 sm:w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-28 sm:w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <Card
              key={stat.title}
              className="border-border/60 hover:shadow-md transition-shadow cursor-pointer"
              onClick={stat.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="text-muted-foreground rounded-md p-1.5 sm:p-2 bg-muted/30 shrink-0">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-semibold text-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span
                    className={
                      stat.change.startsWith("+") &&
                      stat.change !== "+0" &&
                      stat.change !== "+0%"
                        ? "text-green-400"
                        : "text-muted-foreground"
                    }
                  >
                    {stat.change}
                  </span>{" "}
                  {stat.changeSummary}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="flex flex-col h-[320px] sm:h-[400px] relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base tracking-tight text-muted-foreground">
                Recent Tickets
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/tickets")}
                className="text-xs"
              >
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <RecentTicketsWidget />
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[320px] sm:h-[400px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base tracking-tight text-muted-foreground">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start h-10 sm:h-11"
                onClick={() => navigate("/tickets/new")}
              >
                <FileText className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">Create New Ticket</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-10 sm:h-11"
                onClick={() => navigate("/tickets")}
              >
                <FileText className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">View All Tickets</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-10 sm:h-11"
                onClick={() => navigate("/projects")}
              >
                <FolderKanban className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">Browse Projects</span>
              </Button>
              {role === "admin" && (
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 sm:h-11"
                  onClick={() => navigate("/clients")}
                >
                  <Users className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">Manage Clients</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
