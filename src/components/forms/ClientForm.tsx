import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function ClientForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formState, setFormState] = useState({
    name: "",
    domain: "",
    active: true,
    saving: false,
  });

  async function handleSave() {
    if (!formState.name.trim()) return;
    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      const { create } = await import("@/api/clients");
      await create({
        name: formState.name,
        domain: formState.domain || undefined,
        active: formState.active,
      });
      onSuccess?.();
    } finally {
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Client</h2>
        <p className="text-sm text-muted-foreground">Create or edit client</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Client name{" "}
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
          <Label>Domain</Label>
          <Input
            placeholder="acme.com"
            value={formState.domain}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, domain: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Optional domain for client
          </p>
        </div>

        <div className="md:col-span-2 flex items-center justify-between">
          <div>
            <Label>Active</Label>
            <p className="text-xs text-muted-foreground">
              Toggle client active status
            </p>
          </div>
          <Switch
            checked={formState.active}
            onCheckedChange={(v) =>
              setFormState((prev) => ({ ...prev, active: Boolean(v) }))
            }
            aria-label="Active"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" disabled={formState.saving}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!formState.name.trim() || formState.saving}
        >
          {formState.saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default ClientForm;
