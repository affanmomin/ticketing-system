import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import * as clientsApi from "@/api/clients";
import * as projectsApi from "@/api/projects";
import { toast } from "@/hooks/use-toast";
import type { Project } from "@/types/api";
import { cn } from "@/lib/utils";

export function ProjectForm({
  project,
  onSuccess,
  onCancel,
}: {
  project?: Project;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [formState, setFormState] = useState({
    name: project?.name || "",
    client: project?.clientId || "",
    description: project?.description || "",
    startDate: project?.startDate || "",
    endDate: project?.endDate || "",
    saving: false,
  });
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    []
  );

  useEffect(() => {
    (async () => {
      const { data } = await clientsApi.list({ limit: 200, offset: 0 });
      const items = data.data.map((c) => ({ id: c.id, name: c.name }));
      setClients(items);
      if (items.length && !project)
        setFormState((prev) => ({ ...prev, client: items[0].id }));
    })();
  }, [project]);

  async function handleSave() {
    if (!formState.name.trim() || !formState.client) return;
    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      const payload = {
        clientId: formState.client,
        name: formState.name,
        description: formState.description.trim() || undefined,
        startDate: formState.startDate || undefined,
        endDate: formState.endDate || undefined,
      };

      if (project) {
        // Update existing project
        await projectsApi.update(project.id, payload);
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        // Create new project
        await projectsApi.create(payload);
        toast({
          title: "Success",
          description: "Project created successfully",
        });
      }
      onSuccess?.();
    } catch (e: any) {
      toast({
        title: `Failed to ${project ? "update" : "create"} project`,
        description: e?.response?.data?.message || "Error",
        variant: "destructive",
      });
    } finally {
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">
          {project ? "Edit Project" : "Create Project"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {project
            ? "Update project details and timeline"
            : "Set up a new project under an existing client organization"}
        </p>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm font-medium">
              Project Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="project-name"
              placeholder="e.g., Customer Portal"
              value={formState.name}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, name: e.target.value }))
              }
              aria-required="true"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-client" className="text-sm font-medium">
              Client
            </Label>
            <Select
              value={formState.client}
              onValueChange={(v) =>
                setFormState((prev) => ({ ...prev, client: String(v) }))
              }
            >
              <SelectTrigger id="project-client" className="w-full h-10">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No clients available
                  </div>
                ) : (
                  clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="project-description"
            value={formState.description}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
            placeholder="Optional project overview or scope details"
            className="min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project-start" className="text-sm font-medium">
              Start date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="project-start"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !formState.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formState.startDate ? (
                    format(new Date(formState.startDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formState.startDate ? new Date(formState.startDate) : undefined}
                  onSelect={(date) =>
                    setFormState((prev) => ({
                      ...prev,
                      startDate: date ? format(date, "yyyy-MM-dd") : "",
                    }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-end" className="text-sm font-medium">
              Target completion
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="project-end"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !formState.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formState.endDate ? (
                    format(new Date(formState.endDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formState.endDate ? new Date(formState.endDate) : undefined}
                  onSelect={(date) =>
                    setFormState((prev) => ({
                      ...prev,
                      endDate: date ? format(date, "yyyy-MM-dd") : "",
                    }))
                  }
                  disabled={(date) =>
                    formState.startDate ? date < new Date(formState.startDate) : false
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={formState.saving}
          className="min-w-[80px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={
            !formState.name.trim() || !formState.client || formState.saving
          }
          className="min-w-[80px]"
        >
          {formState.saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {project ? "Updating" : "Saving"}
            </span>
          ) : project ? (
            "Update Project"
          ) : (
            "Save Project"
          )}
        </Button>
      </div>
    </div>
  );
}

export default ProjectForm;
