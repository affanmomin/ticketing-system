import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, GitBranch, Ticket, Settings, ArrowLeft } from "lucide-react";
import * as projectsApi from "@/api/projects";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ProjectForm from "@/components/forms/ProjectForm";
import StreamForm from "@/components/forms/StreamForm";
import TicketCreateForm from "@/components/forms/TicketCreateForm";

type ProjectDetail = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  clientId: string;
  createdAt: string;
  streams: Array<{
    id: string;
    name: string;
    createdAt: string;
  }>;
  tickets: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    dueDate?: string | null;
    assignee?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [openStream, setOpenStream] = useState(false);
  const [openTicket, setOpenTicket] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadProject() {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await projectsApi.get(id);
      setProject(data as any as ProjectDetail);
    } catch (error) {
      console.error("Failed to load project details:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshProject() {
    if (id) {
      await loadProject();
    }
  }

  useEffect(() => {
    loadProject();
  }, [id]);

  if (loading || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                {project.code}
              </code>
              <Badge variant={project.active ? "default" : "secondary"}>
                {project.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <ProjectForm
                onSuccess={() => {
                  setOpenEdit(false);
                  refreshProject();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for Organization */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">
            Tickets ({project.tickets?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="streams">
            Streams ({project.streams?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Tickets
                  </span>
                  <span className="text-2xl font-bold">
                    {project.tickets?.length || 0}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Active Streams
                  </span>
                  <span className="text-2xl font-bold">
                    {project.streams?.length || 0}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Open Tickets
                  </span>
                  <span className="text-2xl font-bold">
                    {project.tickets?.filter(
                      (t) => t.status !== "DONE" && t.status !== "CANCELLED"
                    ).length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Project Code</p>
                  <code className="text-base font-mono">{project.code}</code>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={project.active ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {project.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-base">
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Manage all tickets for this project
            </p>
            <Dialog open={openTicket} onOpenChange={setOpenTicket}>
              <DialogTrigger asChild>
                <Button>
                  <Ticket className="w-4 h-4 mr-2" />
                  Create Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <TicketCreateForm
                  clientId={project.clientId}
                  projectId={project.id}
                  onCancel={() => setOpenTicket(false)}
                  onSuccess={() => {
                    setOpenTicket(false);
                    refreshProject();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {project.tickets?.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.tickets.map((ticket: any) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        {ticket.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ticket.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ticket.assignee?.name || "Unassigned"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {ticket.dueDate
                          ? new Date(ticket.dueDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first ticket to get started
                </p>
                <Dialog open={openTicket} onOpenChange={setOpenTicket}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <TicketCreateForm
                      clientId={project.clientId}
                      projectId={project.id}
                      onSuccess={() => {
                        setOpenTicket(false);
                        refreshProject();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Streams Tab */}
        <TabsContent value="streams" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Organize work into streams
            </p>
            <Dialog open={openStream} onOpenChange={setOpenStream}>
              <DialogTrigger asChild>
                <Button>
                  <GitBranch className="w-4 h-4 mr-2" />
                  Create Stream
                </Button>
              </DialogTrigger>
              <DialogContent>
                <StreamForm
                  projectId={project.id}
                  onSuccess={() => {
                    setOpenStream(false);
                    refreshProject();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {project.streams?.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {project.streams.map((stream) => (
                <Card key={stream.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      {stream.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tickets</span>
                        <span className="font-medium">
                          {project.tickets?.filter(
                            (t: any) => t.streamId === stream.id
                          ).length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">
                          {new Date(stream.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GitBranch className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No streams yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create streams to organize your work
                </p>
                <Dialog open={openStream} onOpenChange={setOpenStream}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Stream
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <StreamForm
                      projectId={project.id}
                      onSuccess={() => {
                        setOpenStream(false);
                        refreshProject();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
