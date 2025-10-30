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
import * as projectsApi from "@/api/projects";
import * as streamsApi from "@/api/streams";
import { toast } from "@/hooks/use-toast";

export function StreamForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formState, setFormState] = useState({
    name: "",
    project: "",
    saving: false,
  });
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    []
  );

  useEffect(() => {
    (async () => {
      const { data } = await projectsApi.list();
      const items = data.map((p) => ({ id: p.id, name: p.name }));
      setProjects(items);
      if (items.length)
        setFormState((prev) => ({ ...prev, project: items[0].id }));
    })();
  }, []);

  async function handleSave() {
    if (!formState.name.trim() || !formState.project) return;
    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      await streamsApi.create({
        projectId: formState.project,
        name: formState.name,
      });
      toast({
        title: "Success",
        description: "Stream created successfully",
      });
      onSuccess?.();
    } catch (e: any) {
      toast({
        title: "Failed to save stream",
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
        <h2 className="text-xl font-semibold tracking-tight">Create Stream</h2>
        <p className="text-sm text-muted-foreground">
          Add a new stream to organize work within a project
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Stream Name & Project Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="stream-name" className="text-sm font-medium">
              Stream Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="stream-name"
              placeholder="e.g., Development, QA, Production"
              value={formState.name}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, name: e.target.value }))
              }
              aria-required="true"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stream-project" className="text-sm font-medium">
              Project
            </Label>
            <Select
              value={formState.project}
              onValueChange={(v) =>
                setFormState((prev) => ({ ...prev, project: String(v) }))
              }
            >
              <SelectTrigger id="stream-project" className="w-full h-10">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No projects available
                  </div>
                ) : (
                  projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
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
            !formState.name.trim() || !formState.project || formState.saving
          }
          className="min-w-[80px]"
        >
          {formState.saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving
            </span>
          ) : (
            "Create Stream"
          )}
        </Button>
      </div>
    </div>
  );
}

export default StreamForm;
