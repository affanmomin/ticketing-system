import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import * as clientsApi from "@/api/clients";
import {
  getEmailError,
  getPhoneError,
  getNameError,
} from "@/lib/validations";

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
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

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
    // Validate all fields
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    
    const nameError = getNameError(formState.name, "Client name");
    if (nameError) newErrors.name = nameError;
    
    if (formState.email.trim()) {
      const emailError = getEmailError(formState.email);
      if (emailError) newErrors.email = emailError;
    }
    
    if (formState.phone.trim()) {
      const phoneError = getPhoneError(formState.phone);
      if (phoneError) newErrors.phone = phoneError;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Validation error",
        description: Object.values(newErrors)[0] || "Please fix the errors",
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
              onChange={(event) => {
                setFormState((prev) => ({ ...prev, name: event.target.value }));
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              className="h-10"
              required
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-client-email" className="text-sm font-medium">
              Contact Email
            </Label>
            <Input
              id="edit-client-email"
              type="email"
              value={formState.email}
              onChange={(event) => {
                setFormState((prev) => ({ ...prev, email: event.target.value }));
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="ops@acme.com"
              className="h-10"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="edit-client-phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="edit-client-phone"
              type="tel"
              value={formState.phone}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, '').slice(0, 10);
                setFormState((prev) => ({ ...prev, phone: value }));
                if (errors.phone) {
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              placeholder=""
              maxLength={10}
              className="h-10"
            />
            {errors.phone ? (
              <p className="text-xs text-destructive">{errors.phone}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Enter 10 digit phone number
              </p>
            )}
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
          disabled={
            formState.saving ||
            Object.keys(errors).length > 0
          }
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
