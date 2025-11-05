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
import * as clientsApi from "@/api/clients";
import * as projectsApi from "@/api/projects";
import { toast } from "@/hooks/use-toast";

export function ProjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formState, setFormState] = useState({
    name: "",
    client: "",
    description: "",
    startDate: "",
    endDate: "",
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
      if (items.length)
        setFormState((prev) => ({ ...prev, client: items[0].id }));
    })();
  }, []);

  async function handleSave() {
    if (!formState.name.trim() || !formState.client) return;
    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      await projectsApi.create({
        clientId: formState.client,
        name: formState.name,
        description: formState.description.trim() || undefined,
        startDate: formState.startDate || undefined,
        endDate: formState.endDate || undefined,
      });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      onSuccess?.();
    } catch (e: any) {
      toast({
        title: "Failed to save project",
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
        <h2 className="text-xl font-semibold tracking-tight">Create Project</h2>
        <p className="text-sm text-muted-foreground">
          Set up a new project under an existing client organization
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
            <Input
              id="project-start"
              type="date"
              value={formState.startDate}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  startDate: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-end" className="text-sm font-medium">
              Target completion
            </Label>
            <Input
              id="project-end"
              type="date"
              value={formState.endDate}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  endDate: event.target.value,
                }))
              }
              min={formState.startDate || undefined}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
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
              Saving
            </span>
          ) : (
            "Save Project"
          )}
        </Button>
      </div>
    </div>
  );
}

export default ProjectForm;
