import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderKanban, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import * as authApi from "@/api/auth";

export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] =
    useState<authApi.DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data } = await authApi.getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // Bypass auth-dependent rendering: provide sensible fallbacks when no profile
  const role =
    (user?.role?.toLowerCase?.() as
      | "admin"
      | "employee"
      | "client"
      | undefined) ?? "admin";
  const firstName = user?.name || "User";

  const stats = dashboardData
    ? [
        {
          title: "Total Tickets",
          value: dashboardData.dashboard.totalTickets.count.toString(),
          icon: <FileText className="w-5 h-5" />,
          change: dashboardData.dashboard.totalTickets.changeLabel,
          changeSummary: dashboardData.dashboard.totalTickets.changeSummary,
        },
        {
          title: "Active Projects",
          value: dashboardData.dashboard.activeProjects.count.toString(),
          icon: <FolderKanban className="w-5 h-5" />,
          change: dashboardData.dashboard.activeProjects.changeLabel,
          changeSummary: dashboardData.dashboard.activeProjects.changeSummary,
        },
        {
          title: role === "admin" ? "Total Users" : "Team Members",
          value: dashboardData.dashboard.totalUsers.count.toString(),
          icon: <Users className="w-5 h-5" />,
          change: dashboardData.dashboard.totalUsers.changeLabel,
          changeSummary: dashboardData.dashboard.totalUsers.changeSummary,
        },
        {
          title: "Completed Tickets",
          value: dashboardData.dashboard.completedTickets.count.toString(),
          icon: <CheckCircle2 className="w-5 h-5" />,
          change: dashboardData.dashboard.completedTickets.changeLabel,
          changeSummary: dashboardData.dashboard.completedTickets.changeSummary,
        },
      ]
    : [
        {
          title: "Total Tickets",
          value: "0",
          icon: <FileText className="w-5 h-5" />,
          change: "+0%",
          changeSummary: "from last month",
        },
        {
          title: "Active Projects",
          value: "0",
          icon: <FolderKanban className="w-5 h-5" />,
          change: "+0",
          changeSummary: "from last month",
        },
        {
          title: role === "admin" ? "Total Users" : "Team Members",
          value: "0",
          icon: <Users className="w-5 h-5" />,
          change: "+0",
          changeSummary: "from last month",
        },
        {
          title: "Completed",
          value: "0",
          icon: <CheckCircle2 className="w-5 h-5" />,
          change: "+0",
          changeSummary: "from last month",
        },
      ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`Here's what's happening with your ${role === "client" ? "projects" : "workspace"} today.`}
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-8 bg-muted animate-pulse rounded-md" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="text-muted-foreground rounded-md p-2 bg-muted/30">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col h-[400px] relative">
          <CardHeader>
            <CardTitle className="tracking-tight text-muted-foreground">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <div className="w-2 h-2 rounded-full bg-muted mt-2" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.dashboard.recentActivity.length ? (
              <div className="space-y-2 pb-2">
                {dashboardData.dashboard.recentActivity
                  .slice(0, 10)
                  .map((activity) => (
                    <div
                      key={activity.ticketId}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/tickets/${activity.ticketId}`)}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.title}
                          </p>
                          <Badge
                            variant={
                              activity.status === "DONE"
                                ? "default"
                                : activity.status === "IN_PROGRESS"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {activity.timeAgo}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            )}
          </CardContent>
          {!loading && dashboardData?.dashboard.recentActivity.length ? (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
          ) : null}
        </Card>

        <Card className="flex flex-col h-[400px]">
          <CardHeader>
            <CardTitle className="tracking-tight text-muted-foreground">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/tickets/new")}
              >
                <FileText className="w-4 h-4 mr-2" />
                Create New Ticket
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/tickets")}
              >
                <FileText className="w-4 h-4 mr-2" />
                View All Tickets
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/projects")}
              >
                <FolderKanban className="w-4 h-4 mr-2" />
                Browse Projects
              </Button>
              {role === "admin" && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/clients")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Clients
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
