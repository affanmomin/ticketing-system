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
  const [name, setName] = useState("");
  const [project, setProject] = useState<string>("");
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await projectsApi.list();
      const items = data.map((p) => ({ id: p.id, name: p.name }));
      setProjects(items);
      if (items.length) setProject(items[0].id);
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !project) return;
    setSaving(true);
    try {
      await streamsApi.create({ projectId: project, name });
      onSuccess?.();
    } catch (e: any) {
      toast({
        title: "Failed to save stream",
        description: e?.response?.data?.message || "Error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Stream</h2>
        <p className="text-sm text-muted-foreground">Create or edit a stream</p>
      </div>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={handleSave}
      >
        <div className="space-y-2">
          <Label>
            Stream name{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-required="true"
          />
        </div>

        <div className="space-y-2">
          <Label>Project</Label>
          <Select value={project} onValueChange={(v) => setProject(String(v))}>
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
      </form>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" disabled={saving}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!name.trim() || !project || saving}
          formNoValidate
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default StreamForm;
