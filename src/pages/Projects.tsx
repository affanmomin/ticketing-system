import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, GitBranch, Eye } from "lucide-react";
import * as projectsApi from "@/api/projects";
import { TableRowSkeleton } from "@/components/ui/skeleton";
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
import ProjectForm from "@/components/forms/ProjectForm";
import StreamForm from "@/components/forms/StreamForm";

type Project = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  clientId: string;
  createdAt: string;
};

export function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [openStream, setOpenStream] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  async function load() {
    setLoadingList(true);
    try {
      const { data } = await projectsApi.list();
      setProjects(data);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    load();
  }, []);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your projects and track progress
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={openStream} onOpenChange={setOpenStream}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <GitBranch className="w-4 h-4 mr-2" />
                New Stream
              </Button>
            </DialogTrigger>
            <DialogContent>
              <StreamForm
                onSuccess={() => {
                  setOpenStream(false);
                  load();
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <ProjectForm
                onSuccess={() => {
                  setOpen(false);
                  load();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Projects Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingList ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="p-0">
                      <TableRowSkeleton columns={5} />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No projects found. Create your first project to get started.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {project.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={project.active ? "default" : "secondary"}
                      className="font-normal"
                    >
                      {project.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
