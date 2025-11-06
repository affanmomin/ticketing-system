import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderKanban, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";

export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  // TODO: Dashboard API not implemented yet; using mock data
  const [loading] = useState(false);

  // useEffect(() => {
  //   async function loadDashboard() {
  //     try {
  //       const { data } = await authApi.getDashboard();
  //       setDashboardData(data);
  //     } catch (error) {
  //       console.error("Failed to load dashboard:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   loadDashboard();
  // }, []);

  // Bypass auth-dependent rendering: provide sensible fallbacks when no profile
  const role =
    (user?.role?.toLowerCase?.() as
      | "admin"
      | "employee"
      | "client"
      | undefined) ?? "admin";
  const firstName = user?.fullName || "User";

  // TODO: Dashboard stats API not implemented yet; using fallback values
  const stats = [
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
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="border-border/60 hover:shadow-md transition-shadow"
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
            <CardTitle className="text-sm sm:text-base tracking-tight text-muted-foreground">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-muted mt-2 shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="h-3 sm:h-4 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="h-2 sm:h-3 w-20 sm:w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            )}
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
