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
  const [projectForm, setProjectForm] = useState({
    name: "",
    code: "",
    client: "",
    active: true,
  });
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await clientsApi.list({ limit: 200, offset: 0 });
      const items = data.items.map((c) => ({ id: c.id, name: c.name }));
      setClients(items);
      if (items.length)
        setProjectForm((form) => ({ ...form, client: items[0].id }));
    })();
  }, []);

  async function handleSave() {
    if (!projectForm.name.trim() || !projectForm.code.trim() || !projectForm.client)
      return;
    setSaving(true);
    try {
      await projectsApi.create({
        clientId: projectForm.client,
        name: projectForm.name,
        code: projectForm.code,
        active: projectForm.active,
      });
      onSuccess?.();
    } catch (e: any) {
      toast({
        title: "Failed to save project",
        description: e?.response?.data?.message || "Error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Project</h2>
        <p className="text-sm text-muted-foreground">Create or edit project</p>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Project name{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Input
            value={projectForm.name}
            onChange={(e) =>
              setProjectForm((form) => ({ ...form, name: e.target.value }))
            }
            aria-required="true"
          />
        </div>
        <div className="space-y-2">
          <Label>
            Code{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Input
            maxLength={12}
            value={projectForm.code}
            onChange={(e) =>
              setProjectForm((form) => ({
                ...form,
                code: e.target.value.toUpperCase(),
              }))
            }
            aria-required="true"
          />
          <p className="text-xs text-muted-foreground">Short key like ACM</p>
        </div>

        <div className="space-y-2">
          <Label>Client</Label>
          <Select
            value={projectForm.client}
            onValueChange={(v) =>
              setProjectForm((form) => ({ ...form, client: String(v) }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 flex items-center justify-between">
          <div>
            <Label>Active</Label>
          </div>
          <Switch
            checked={projectForm.active}
            onCheckedChange={(v) =>
              setProjectForm((form) => ({ ...form, active: Boolean(v) }))
            }
            aria-label="Active"
          />
        </div>
      </form>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" disabled={saving}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={
            !projectForm.name.trim() ||
            !projectForm.code.trim() ||
            !projectForm.client ||
            saving
          }
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default ProjectForm;
