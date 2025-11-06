import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import * as clientsApi from "@/api/clients";

interface EditableClient {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  active: boolean;
}

interface ClientEditFormProps {
  client: EditableClient;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientEditForm({
  client,
  onSuccess,
  onCancel,
}: ClientEditFormProps) {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    active: true,
    saving: false,
  });

  useEffect(() => {
    setFormState({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      active: client.active,
      saving: false,
    });
  }, [client]);

  async function handleUpdate() {
    if (!formState.name.trim()) {
      toast({
        title: "Validation error",
        description: "Client name is required",
        variant: "destructive",
      });
      return;
    }

    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      await clientsApi.update(client.id, {
        name: formState.name.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        address: formState.address.trim(),
        active: formState.active,
      });
      toast({
        title: "Client updated",
        description: `${formState.name} has been updated`,
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Failed to update client",
        description:
          error?.response?.data?.message ||
          "There was a problem saving changes",
        variant: "destructive",
      });
    } finally {
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Edit Client</h2>
        <p className="text-sm text-muted-foreground">
          Update the client contact information and activation status
        </p>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="edit-client-name" className="text-sm font-medium">
              Client Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="edit-client-name"
              value={formState.name}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, name: event.target.value }))
              }
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-client-email" className="text-sm font-medium">
              Contact Email
            </Label>
            <Input
              id="edit-client-email"
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="ops@acme.com"
              className="h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="edit-client-phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="edit-client-phone"
              value={formState.phone}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, phone: event.target.value }))
              }
              placeholder="+1 (555) 123-4567"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="edit-client-address"
              className="text-sm font-medium"
            >
              Billing Address
            </Label>
            <Textarea
              id="edit-client-address"
              value={formState.address}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  address: event.target.value,
                }))
              }
              placeholder="123 Market Street, Suite 500, San Francisco, CA"
              className="min-h-[88px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="space-y-0.5">
            <Label htmlFor="edit-client-active" className="text-sm font-medium">
              Active status
            </Label>
            <p className="text-xs text-muted-foreground">
              Inactive clients cannot receive new projects or tickets
            </p>
          </div>
          <Switch
            id="edit-client-active"
            checked={formState.active}
            onCheckedChange={(checked) =>
              setFormState((prev) => ({ ...prev, active: checked }))
            }
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={formState.saving}
          className="min-w-[80px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleUpdate}
          disabled={formState.saving}
          className="min-w-[120px]"
        >
          {formState.saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving
            </span>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  );
}
