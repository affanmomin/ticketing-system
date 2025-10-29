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
      onSuccess?.();
    } catch (e: any) {
      toast({
        title: "Failed to save project",
        description: e?.response?.data?.message || "Error",
      });
    } finally {
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Project</h2>
        <p className="text-sm text-muted-foreground">Create or edit project</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Project name{" "}
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
          <Label>
            Code{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Input
            maxLength={12}
            value={formState.code}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
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
            value={formState.client}
            onValueChange={(v) =>
              setFormState((prev) => ({ ...prev, client: String(v) }))
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
            checked={formState.active}
            onCheckedChange={(v) =>
              setFormState((prev) => ({ ...prev, active: Boolean(v) }))
            }
            aria-label="Active"
          />
        </div>

        <div className="md:col-span-2 flex gap-2 justify-end">
          <Button type="button" variant="ghost" disabled={formState.saving}>
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
          >
            {formState.saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProjectForm;
