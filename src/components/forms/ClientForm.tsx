import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function ClientForm({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { create } = await import("@/api/clients");
      await create({ name, domain: domain || undefined, active });
      onSuccess?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Client</h2>
        <p className="text-sm text-muted-foreground">Create or edit client</p>
      </div>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={handleSave}
      >
        <div className="space-y-2">
          <Label>
            Client name{" "}
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
          <Label>Domain</Label>
          <Input
            placeholder="acme.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
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
            checked={active}
            onCheckedChange={(v) => setActive(Boolean(v))}
            aria-label="Active"
          />
        </div>
      </form>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default ClientForm;
