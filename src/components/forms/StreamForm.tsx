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
      onSuccess?.();
    } catch (e: any) {
      toast({
        title: "Failed to save stream",
        description: e?.response?.data?.message || "Error",
      });
    } finally {
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Stream</h2>
        <p className="text-sm text-muted-foreground">Create or edit a stream</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Stream name{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Input
            value={formState.name}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, name: e.target.value }))
            }
            aria-required="true"
          />
        </div>

        <div className="space-y-2">
          <Label>Project</Label>
          <Select
            value={formState.project}
            onValueChange={(v) =>
              setFormState((prev) => ({ ...prev, project: String(v) }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" disabled={formState.saving}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={
            !formState.name.trim() || !formState.project || formState.saving
          }
        >
          {formState.saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default StreamForm;
