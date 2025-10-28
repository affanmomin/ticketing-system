import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderKanban, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";

export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Bypass auth-dependent rendering: provide sensible fallbacks when no profile
  const role =
    (user?.role?.toLowerCase?.() as
      | "admin"
      | "employee"
      | "client"
      | undefined) ?? "admin";
  const firstName = "User";

  const stats = [
    {
      title: "Total Tickets",
      value: "24",
      icon: <FileText className="w-5 h-5" />,
      change: "+12%",
    },
    {
      title: "Active Projects",
      value: "6",
      icon: <FolderKanban className="w-5 h-5" />,
      change: "+2",
    },
    {
      title: role === "admin" ? "Total Users" : "Team Members",
      value: role === "admin" ? "18" : "8",
      icon: <Users className="w-5 h-5" />,
      change: "+3",
    },
    {
      title: "Completed",
      value: "12",
      icon: <CheckCircle2 className="w-5 h-5" />,
      change: "+5",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`Here's what's happening with your ${role === "client" ? "projects" : "workspace"} today.`}
        actions={
          <Button onClick={() => navigate("/tickets/new")}>New Ticket</Button>
        }
      />

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
                <span className="text-green-400">{stat.change}</span> from last
                month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="tracking-tight text-muted-foreground">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      Ticket #{100 + i} was updated
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {i} hours ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="tracking-tight text-muted-foreground">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
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
