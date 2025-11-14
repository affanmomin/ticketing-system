import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import * as clientsApi from "@/api/clients";
import {
  getEmailError,
  getPhoneError,
  getNameError,
} from "@/lib/validations";

interface ClientFormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  saving: boolean;
}

interface ClientFormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export function ClientForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [formState, setFormState] = useState<ClientFormState>({
    name: "",
    email: "",
    phone: "",
    address: "",
    saving: false,
  });
  const [errors, setErrors] = useState<ClientFormErrors>({});

  async function handleSave() {
    // Validate all fields
    const newErrors: ClientFormErrors = {};
    
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
      await clientsApi.create({
        name: formState.name.trim(),
        email: formState.email.trim() || undefined,
        phone: formState.phone.trim() || undefined,
        address: formState.address.trim() || undefined,
      });
      toast({
        title: "Client created",
        description: `${formState.name} has been added to your organization`,
      });
      onSuccess?.();
      setFormState({
        name: "",
        email: "",
        phone: "",
        address: "",
        saving: false,
      });
    } catch (error: any) {
      toast({
        title: "Failed to create client",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        {/* <h2 className="text-xl font-semibold tracking-tight">Create Client</h2>
        <p className="text-sm text-muted-foreground">
          Register a new client organization for your workspace
        </p> */}
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-6">
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
              onChange={(event) => {
                setFormState((prev) => ({ ...prev, name: event.target.value }));
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              autoFocus
              required
              className="h-10"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-email" className="text-sm font-medium">
              Contact Email
            </Label>
            <Input
              id="client-email"
              type="email"
              placeholder="ops@acme.com"
              value={formState.email}
              onChange={(event) => {
                setFormState((prev) => ({ ...prev, email: event.target.value }));
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              className="h-10"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="client-phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="client-phone"
              type="tel"
              placeholder="1234567890"
              value={formState.phone}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, '').slice(0, 10);
                setFormState((prev) => ({ ...prev, phone: value }));
                if (errors.phone) {
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              maxLength={10}
              className="h-10"
            />
            {errors.phone ? (
              <p className="text-xs text-destructive">{errors.phone}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Enter 10 digit phone number (digits only)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-address" className="text-sm font-medium">
              Billing Address
            </Label>
            <Textarea
              id="client-address"
              placeholder="123 Market Street, Suite 500, San Francisco, CA"
              value={formState.address}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  address: event.target.value,
                }))
              }
              className="min-h-[88px]"
            />
          </div>
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
          onClick={handleSave}
          disabled={
            !formState.name.trim() ||
            formState.saving ||
            Object.keys(errors).length > 0
          }
          className="min-w-[120px]"
        >
          {formState.saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating
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
