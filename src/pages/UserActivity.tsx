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

  // Load users list
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

  // Load user activity when user is selected
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
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select User</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={handleUserChange}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose a user to view their activity" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <span>{user.fullName || user.email}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${roleColors[user.role]}`}
                    >
                      {user.role}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* User Activity Content */}
      {!loading && activity && (
        <>
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="text-base font-medium truncate">
                    {activity.user.fullName}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="text-base font-medium truncate">
                    {activity.user.email}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">Role</div>
                  <Badge
                    variant="outline"
                    className={roleColors[activity.user.role]}
                  >
                    {activity.user.role}
                  </Badge>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge
                    variant={activity.user.isActive ? "default" : "secondary"}
                  >
                    {activity.user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">
                    Member Since
                  </div>
                  <div className="text-base font-medium">
                    {format(new Date(activity.user.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
                {activity.user.clientName && (
                  <div className="min-w-0">
                    <div className="text-sm text-muted-foreground">Client</div>
                    <div className="text-base font-medium truncate">
                      {activity.user.clientName}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ticket Metrics */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="min-w-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">Tickets Created</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-semibold">
                  {activity.tickets.created}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total tickets raised
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">Tickets Assigned</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-semibold">
                  {activity.tickets.assigned}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently or previously assigned
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">Tickets Closed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-semibold text-green-500">
                  {activity.tickets.closed}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Successfully resolved
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">Tickets Open</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-semibold text-orange-500">
                  {activity.tickets.open}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Still in progress
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground truncate">
                    Avg Response Time
                  </div>
                  <div className="text-lg sm:text-xl font-semibold">
                    {activity.performance.averageResponseTime != null
                      ? `${activity.performance.averageResponseTime.toFixed(1)}h`
                      : "N/A"}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground truncate">
                    Avg Resolution Time
                  </div>
                  <div className="text-lg sm:text-xl font-semibold">
                    {activity.performance.averageResolutionTime != null
                      ? `${activity.performance.averageResolutionTime.toFixed(1)}h`
                      : "N/A"}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground truncate">
                    Tickets Closed
                  </div>
                  <div className="text-lg sm:text-xl font-semibold">
                    {activity.performance.ticketsClosedLast30Days}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground truncate">
                    Tickets Created
                  </div>
                  <div className="text-lg sm:text-xl font-semibold">
                    {activity.performance.ticketsCreatedLast30Days}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">Comments</div>
                  <div className="text-lg sm:text-xl font-semibold">
                    {activity.performance.commentsLast30Days}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity & Projects */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total Events
                    </div>
                    <div className="text-2xl font-semibold">
                      {activity.activity.totalEvents}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total Comments
                    </div>
                    <div className="text-2xl font-semibold">
                      {activity.activity.totalComments}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Last Activity
                    </div>
                    <div className="text-base font-medium">
                      {format(
                        new Date(activity.activity.lastActivityAt),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Events by Type
                    </div>
                    <div className="space-y-2">
                      {activity.activity.eventsByType.map((event) => (
                        <div
                          key={event.eventType}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {event.eventType.replace(/_/g, " ")}
                          </span>
                          <span className="font-medium">{event.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5" />
                  Project Involvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total Projects
                    </div>
                    <div className="text-2xl font-semibold">
                      {activity.projects.total}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Active Projects
                    </div>
                    <div className="text-2xl font-semibold">
                      {activity.projects.active}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        As Manager
                      </div>
                      <div className="text-xl font-semibold">
                        {activity.projects.asManager}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        As Member
                      </div>
                      <div className="text-xl font-semibold">
                        {activity.projects.asMember}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Breakdowns */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tickets by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {activity.tickets.byStatus.length > 0 ? (
                  <div className="space-y-2">
                    {activity.tickets.byStatus.map((status) => (
                      <div
                        key={status.statusId}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                      >
                        <span className="text-sm">{status.statusName}</span>
                        <Badge variant="secondary">{status.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tickets assigned
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tickets by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                {activity.tickets.byPriority.length > 0 ? (
                  <div className="space-y-2">
                    {activity.tickets.byPriority.map((priority) => (
                      <div
                        key={priority.priorityId}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                      >
                        <span className="text-sm">{priority.priorityName}</span>
                        <Badge variant="secondary">{priority.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tickets assigned
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
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
