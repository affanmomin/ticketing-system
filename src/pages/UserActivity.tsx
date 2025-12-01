import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FolderKanban,
  MessageSquare,
  TrendingUp,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";

const CHART_COLORS = [
  "hsl(217 91% 60%)", // Modern Blue - professional, trustworthy
  "hsl(142 71% 45%)", // Emerald - success, growth
  "hsl(0 84% 60%)", // Coral Red - important, attention
  "hsl(38 92% 50%)", // Amber - warning, pending
  "hsl(262 83% 58%)", // Indigo Purple - premium, innovation
  "hsl(199 89% 48%)", // Sky Cyan - clarity, modern
  "hsl(25 95% 53%)", // Warm Orange - energy, action
  "hsl(280 70% 60%)", // Lavender - sophisticated, calm
  "hsl(210 100% 56%)", // Azure Blue - focus, precision
  "hsl(158 64% 52%)", // Mint Teal - balance, harmony
];
import * as dashboardApi from "@/api/dashboard";
import * as usersApi from "@/api/users";
import type { UserActivityResponse, AuthUser } from "@/types/api";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function UserActivity() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(userId || "");
  const [activity, setActivity] = useState<UserActivityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setUsersLoading(true);
      try {
        const { data } = await usersApi.list({ limit: 100, offset: 0 });
        setUsers(data.data);
      } catch (error: any) {
        console.error("Failed to load users:", error);
        toast({
          title: "Failed to load users",
          description: error?.response?.data?.message || "Unexpected error",
          variant: "destructive",
        });
      } finally {
        setUsersLoading(false);
      }
    }
    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;

    async function loadUserActivity() {
      setLoading(true);
      try {
        const { data } = await dashboardApi.getUserActivity(selectedUserId);
        setActivity(data);
      } catch (error: any) {
        console.error("Failed to load user activity:", error);
        toast({
          title: "Failed to load user activity",
          description: error?.response?.data?.message || "Unexpected error",
          variant: "destructive",
        });
        setActivity(null);
      } finally {
        setLoading(false);
      }
    }
    loadUserActivity();
  }, [selectedUserId]);

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    navigate(`/users/${userId}/activity`);
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    EMPLOYEE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    CLIENT: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  if (usersLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="User Activity & Performance"
          description="View detailed activity and performance metrics for team members"
        />
        <Skeleton className="h-10 w-full max-w-xs" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="User Activity & Performance"
          description="View detailed activity and performance metrics for team members"
        />
        <Button
          variant="outline"
          onClick={() => navigate("/users")}
          className="shrink-0"
        >
          Back to Users
        </Button>
      </div>

      {/* User Selector */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="w-4 h-4" />
            Select User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={handleUserChange}>
            <SelectTrigger className="w-full max-w-md h-11">
              <SelectValue placeholder="Choose a user to view their activity" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <span>{user.fullName || user.email}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-2">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-20 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* User Activity Content */}
      {!loading && activity && (
        <div className="space-y-6">
          {/* User Info Card */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div className="min-w-0 p-3 rounded-lg bg-muted/30 border">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                    Name
                  </div>
                  <div className="text-base font-semibold truncate">
                    {activity.user.fullName}
                  </div>
                </div>
                <div className="min-w-0 p-3 rounded-lg bg-muted/30 border">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                    Email
                  </div>
                  <div className="text-base font-semibold truncate">
                    {activity.user.email}
                  </div>
                </div>
                <div className="min-w-0 p-3 rounded-lg bg-muted/30 border">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                    Role
                  </div>
                  <Badge
                    variant="outline"
                    className={`${roleColors[activity.user.role]} font-semibold`}
                  >
                    {activity.user.role}
                  </Badge>
                </div>
                <div className="min-w-0 p-3 rounded-lg bg-muted/30 border">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                    Status
                  </div>
                  <Badge
                    variant={activity.user.isActive ? "default" : "secondary"}
                    className="font-semibold"
                  >
                    {activity.user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="min-w-0 p-3 rounded-lg bg-muted/30 border">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                    Member Since
                  </div>
                  <div className="text-base font-semibold">
                    {format(new Date(activity.user.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
                {activity.user.clientName && (
                  <div className="min-w-0 p-3 rounded-lg bg-muted/30 border">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                      Client
                    </div>
                    <div className="text-base font-semibold truncate">
                      {activity.user.clientName}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ticket Metrics */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Ticket Metrics
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-500/10">
                      <FileText className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="truncate">Tickets Created</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">
                    {activity.tickets.created}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total tickets raised
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-purple-500/10">
                      <FileText className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="truncate">Tickets Assigned</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">
                    {activity.tickets.assigned}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently or previously assigned
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-green-500/10">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="truncate">Tickets Closed</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1 text-green-600 dark:text-green-400">
                    {activity.tickets.closed}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successfully resolved
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-orange-500/10">
                      <AlertCircle className="w-4 h-4 shrink-0 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="truncate">Tickets Open</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1 text-orange-600 dark:text-orange-400">
                    {activity.tickets.open}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Still in progress
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Metrics
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-green-500/10">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    Tickets Closed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1 text-green-600 dark:text-green-400">
                    {activity.performance.ticketsClosedLast30Days}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-500/10">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Tickets Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1 text-blue-600 dark:text-blue-400">
                    {activity.performance.ticketsCreatedLast30Days}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-purple-500/10">
                      <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1 text-purple-600 dark:text-purple-400">
                    {activity.performance.commentsLast30Days}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
              {activity.performance.averageResponseTime != null && (
                <Card className="border-2 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-orange-500/10">
                        <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      Avg Response
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1 text-orange-600 dark:text-orange-400">
                      {activity.performance.averageResponseTime.toFixed(1)}h
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average time
                    </p>
                  </CardContent>
                </Card>
              )}
              {activity.performance.averageResolutionTime != null && (
                <Card className="border-2 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-indigo-500/10">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Avg Resolution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1 text-indigo-600 dark:text-indigo-400">
                      {activity.performance.averageResolutionTime.toFixed(1)}h
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average time
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Activity & Projects */}
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30 border">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Total Events
                        </div>
                        <div className="text-3xl font-bold">
                          {activity.activity.totalEvents}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Total Comments
                        </div>
                        <div className="text-3xl font-bold">
                          {activity.activity.totalComments}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Last Activity
                      </div>
                      <div className="text-base font-semibold">
                        {activity.activity.lastActivityAt
                          ? format(
                              new Date(activity.activity.lastActivityAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )
                          : "No activity yet"}
                      </div>
                    </div>
                    {activity.activity.eventsByType.length > 0 && (
                      <div className="pt-2">
                        <div className="text-sm font-semibold mb-3">
                          Events by Type
                        </div>
                        <div className="space-y-2">
                          {activity.activity.eventsByType.map((event) => (
                            <div
                              key={event.eventType}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                            >
                              <span className="text-sm font-medium capitalize">
                                {event.eventType.replace(/_/g, " ")}
                              </span>
                              <Badge
                                variant="secondary"
                                className="font-semibold"
                              >
                                {event.count}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FolderKanban className="w-5 h-5 text-primary" />
                    </div>
                    Project Involvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30 border">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Total Projects
                        </div>
                        <div className="text-3xl font-bold">
                          {activity.projects.total}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Active Projects
                        </div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {activity.projects.active}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30 border">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          As Manager
                        </div>
                        <div className="text-2xl font-bold">
                          {activity.projects.asManager}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          As Member
                        </div>
                        <div className="text-2xl font-bold">
                          {activity.projects.asMember}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Ticket Breakdowns */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Ticket Breakdowns
            </h2>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-500/10">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Tickets by Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activity.tickets.byStatus.length > 0 ? (
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                      <ChartContainer
                        config={activity.tickets.byStatus.reduce(
                          (acc, status, index) => {
                            acc[status.statusId] = {
                              label: status.statusName,
                              color: CHART_COLORS[index % CHART_COLORS.length],
                            };
                            return acc;
                          },
                          {} as Record<string, { label: string; color: string }>
                        )}
                        className="h-[250px] w-full lg:w-1/2"
                      >
                        <PieChart>
                          <Pie
                            data={activity.tickets.byStatus.map((status) => ({
                              name: status.statusName,
                              value: status.count,
                              id: status.statusId,
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {activity.tickets.byStatus.map((status, index) => (
                              <Cell
                                key={`cell-${status.statusId}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                      <div className="flex-1 space-y-2 w-full lg:w-auto">
                        {activity.tickets.byStatus.map((status, index) => (
                          <div
                            key={status.statusId}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    CHART_COLORS[index % CHART_COLORS.length],
                                }}
                              />
                              <span className="text-sm font-medium">
                                {status.statusName}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="font-semibold"
                            >
                              {status.count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground font-medium">
                        No tickets by status
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-orange-500/10">
                      <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    Tickets by Priority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activity.tickets.byPriority.length > 0 ? (
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                      <ChartContainer
                        config={activity.tickets.byPriority.reduce(
                          (acc, priority, index) => {
                            acc[priority.priorityId] = {
                              label: priority.priorityName,
                              color: CHART_COLORS[index % CHART_COLORS.length],
                            };
                            return acc;
                          },
                          {} as Record<string, { label: string; color: string }>
                        )}
                        className="h-[250px] w-full lg:w-1/2"
                      >
                        <PieChart>
                          <Pie
                            data={activity.tickets.byPriority.map(
                              (priority) => ({
                                name: priority.priorityName,
                                value: priority.count,
                                id: priority.priorityId,
                              })
                            )}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {activity.tickets.byPriority.map(
                              (priority, index) => (
                                <Cell
                                  key={`cell-${priority.priorityId}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              )
                            )}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                      <div className="flex-1 space-y-2 w-full lg:w-auto">
                        {activity.tickets.byPriority.map((priority, index) => (
                          <div
                            key={priority.priorityId}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    CHART_COLORS[index % CHART_COLORS.length],
                                }}
                              />
                              <span className="text-sm font-medium">
                                {priority.priorityName}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="font-semibold"
                            >
                              {priority.count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground font-medium">
                        No tickets by priority
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !activity && selectedUserId && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              Unable to load user activity data
            </p>
          </CardContent>
        </Card>
      )}

      {!selectedUserId && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              Select a user to view their activity and performance metrics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
