import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import * as clientsApi from "@/api/clients";

type Client = {
  id: string;
  name: string;
  domain?: string | null;
  active: boolean;
};

type ClientEditFormProps = {
  client: Client;
  onSuccess?: () => void;
};

export function ClientEditForm({ client, onSuccess }: ClientEditFormProps) {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    name: "",
    domain: "",
    active: true,
    saving: false,
  });

  useEffect(() => {
    setFormState({
      name: client.name,
      domain: client.domain || "",
      active: client.active,
      saving: false,
    });
  }, [client]);

  const handleUpdate = async () => {
    if (!formState.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Client name is required",
        variant: "destructive",
      });
      return;
    }

    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      await clientsApi.update(client.id, {
        name: formState.name,
        domain: formState.domain || undefined,
        active: formState.active,
      });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update client",
        variant: "destructive",
      });
    } finally {
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Edit Client</h2>
        <p className="text-sm text-muted-foreground">
          Update client information and settings
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
              placeholder="Enter client name"
              value={formState.name}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, name: e.target.value }))
              }
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-domain" className="text-sm font-medium">
              Domain
            </Label>
            <Input
              id="client-domain"
              placeholder="example.com"
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
            onCheckedChange={(checked) =>
              setFormState((prev) => ({ ...prev, active: checked }))
            }
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
          onClick={handleUpdate}
          disabled={formState.saving}
          className="min-w-[100px]"
        >
          {formState.saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
