import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

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
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      onSuccess?.();
    } catch (e: any) {
      toast({
        title: "Failed to create client",
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
        <h2 className="text-xl font-semibold tracking-tight">Create Client</h2>
        <p className="text-sm text-muted-foreground">
          Add a new client organization to your workspace
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Client Name & Domain Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="client-name" className="text-sm font-medium">
              Client Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="client-name"
              placeholder="e.g., Acme Corporation"
              value={formState.name}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, name: e.target.value }))
              }
              aria-required="true"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-domain" className="text-sm font-medium">
              Domain
            </Label>
            <Input
              id="client-domain"
              placeholder="acme.com"
              value={formState.domain}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, domain: e.target.value }))
              }
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Optional domain for client identification
            </p>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="space-y-0.5">
            <Label htmlFor="client-active" className="text-sm font-medium">
              Active Status
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable or disable this client
            </p>
          </div>
          <Switch
            id="client-active"
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
          disabled={!formState.name.trim() || formState.saving}
          className="min-w-[80px]"
        >
          {formState.saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving
            </span>
          ) : (
            "Create Client"
          )}
        </Button>
      </div>
    </div>
  );
}

export default ClientForm;
