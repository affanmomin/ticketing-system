import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, GitBranch } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import * as projectsApi from "@/api/projects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProjectForm from "@/components/forms/ProjectForm";
import StreamForm from "@/components/forms/StreamForm";

export function Projects() {
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [open, setOpen] = useState(false);
  const [openStream, setOpenStream] = useState(false);

  async function load() {
    const { data } = await projectsApi.list();
    setProjects(data);
  }

  useEffect(() => {
    load();
  }, []);
  return (
    <div className="space-y-6">
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
              <DialogHeader>
                <DialogTitle>Create Stream</DialogTitle>
              </DialogHeader>
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
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
              </DialogHeader>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            id={p.id}
            name={p.name}
            description={null}
            color="#5E81F4"
            openTickets={0}
            closedTickets={0}
            members={[]}
          />
        ))}
        {projects.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No projects found.
          </div>
        )}
      </div>
    </div>
  );
}
