import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import * as clientsApi from "@/api/clients";
import * as projectsApi from "@/api/projects";
import { toast } from "@/hooks/use-toast";

export function ProjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formState, setFormState] = useState({
    name: "",
    code: "",
    client: "",
    active: true,
    saving: false,
  });
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    []
  );

  useEffect(() => {
    (async () => {
      const { data } = await clientsApi.list({ limit: 200, offset: 0 });
      const items = data.items.map((c) => ({ id: c.id, name: c.name }));
      setClients(items);
      if (items.length)
        setFormState((prev) => ({ ...prev, client: items[0].id }));
    })();
  }, []);

  async function handleSave() {
    if (!formState.name.trim() || !formState.code.trim() || !formState.client)
      return;
    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      await projectsApi.create({
        clientId: formState.client,
        name: formState.name,
        code: formState.code,
        active: formState.active,
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
      {/* Header Section */}
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Create Project</h2>
        <p className="text-sm text-muted-foreground">
          Set up a new project with a unique code and client assignment
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Project Name & Code Row */}
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
            <Label htmlFor="project-code" className="text-sm font-medium">
              Project Code
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="project-code"
              placeholder="e.g., CP"
              maxLength={12}
              value={formState.code}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
              aria-required="true"
              className="h-10 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Short identifier (max 12 characters)
            </p>
          </div>
        </div>

        {/* Client Selection */}
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

        {/* Active Status */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="space-y-0.5">
            <Label htmlFor="project-active" className="text-sm font-medium">
              Active Status
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable or disable this project
            </p>
          </div>
          <Switch
            id="project-active"
            checked={formState.active}
            onCheckedChange={(v) =>
              setFormState((prev) => ({ ...prev, active: Boolean(v) }))
            }
            aria-label="Active"
          />
        </div>
      </div>

      {/* Footer Actions */}
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
            !formState.name.trim() ||
            !formState.code.trim() ||
            !formState.client ||
            formState.saving
          }
          className="min-w-[80px]"
        >
          {formState.saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving
            </span>
          ) : (
            "Create Project"
          )}
        </Button>
      </div>
    </div>
  );
}

export default ProjectForm;
