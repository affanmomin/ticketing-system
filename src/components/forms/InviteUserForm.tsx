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
import { toast } from "@/hooks/use-toast";
import * as usersApi from "@/api/users";
import * as clientsApi from "@/api/clients";
import {
  getEmailError,
  getNameError,
} from "@/lib/validations";

type CreateUserFormState = {
  fullName: string;
  email: string;
  password: string;
  role: "EMPLOYEE" | "CLIENT";
  clientId: string;
  saving: boolean;
};

export function InviteUserForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [formState, setFormState] = useState<CreateUserFormState>({
    fullName: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    clientId: "",
    saving: false,
  });
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    []
  );

  useEffect(() => {
    (async () => {
      try {
        const { data } = await clientsApi.list({ limit: 200, offset: 0 });
        setClients(
          data.data.map((client) => ({ id: client.id, name: client.name }))
        );
      } catch (e) {
        console.error("Failed to load clients:", e);
      }
    })();
  }, []);

  async function handleInvite() {
    // Validate all fields
    const nameError = getNameError(formState.fullName, "Full name");
    const emailError = getEmailError(formState.email);
    
    if (nameError || emailError) {
      toast({
        title: "Validation Error",
        description: nameError || emailError || "Please fix the errors",
        variant: "destructive",
      });
      return;
    }

    if (!formState.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Password is required",
        variant: "destructive",
      });
      return;
    }

    if (formState.password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    if (formState.role === "CLIENT" && !formState.clientId) {
      toast({
        title: "Validation error",
        description: "Select a client for client users",
        variant: "destructive",
      });
      return;
    }

    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      if (formState.role === "EMPLOYEE") {
        await usersApi.createEmployee({
          fullName: formState.fullName.trim(),
          email: formState.email.trim(),
          password: formState.password,
        });
      } else {
        await usersApi.createClientUser({
          fullName: formState.fullName.trim(),
          email: formState.email.trim(),
          password: formState.password,
          clientId: formState.clientId,
        });
      }
      toast({
        title: "User created",
        description: `${formState.fullName} now has access to the workspace`,
      });
      onSuccess?.();
      setFormState({
        fullName: "",
        email: "",
        password: "",
        role: formState.role,
        clientId: "",
        saving: false,
      });
    } catch (error: any) {
      toast({
        title: "Failed to create user",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Invite User</h2>
        <p className="text-sm text-muted-foreground">
          Invite a new user to join your workspace
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Name & Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="invite-name" className="text-sm font-medium">
              Full Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="invite-name"
              placeholder="Enter full name"
              value={formState.fullName}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, fullName: e.target.value }))
              }
              aria-required="true"
              className="h-10"
            />
            {getNameError(formState.fullName, "Full name") && formState.fullName.trim() && (
              <p className="text-xs text-destructive">
                {getNameError(formState.fullName, "Full name")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-sm font-medium">
              Email
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="user@example.com"
              value={formState.email}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, email: e.target.value }))
              }
              aria-required="true"
              className="h-10"
            />
            {getEmailError(formState.email) && formState.email.trim() && (
              <p className="text-xs text-destructive">
                {getEmailError(formState.email)}
              </p>
            )}
          </div>
        </div>

        {/* Password & User Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="invite-password" className="text-sm font-medium">
              Password
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="invite-password"
              type="password"
              placeholder="Minimum 8 characters"
              value={formState.password}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, password: e.target.value }))
              }
              aria-required="true"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-user-type" className="text-sm font-medium">
              User Role
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              value={formState.role}
              onValueChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  role: v as "EMPLOYEE" | "CLIENT",
                  clientId: v === "CLIENT" ? prev.clientId : "",
                }))
              }
            >
              <SelectTrigger id="invite-user-type" className="w-full h-10">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="CLIENT">Client</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Employees belong to your organization. Clients are scoped to a
              client account.
            </p>
          </div>
        </div>

        {/* Client Company (conditional) */}
        {formState.role === "CLIENT" && (
          <div className="space-y-2">
            <Label htmlFor="invite-client" className="text-sm font-medium">
              Client Company
            </Label>
            <Select
              value={formState.clientId}
              onValueChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  clientId: String(v),
                }))
              }
            >
              <SelectTrigger id="invite-client" className="w-full h-10">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No clients available
                  </div>
                ) : (
                  clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Required for client user type
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
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
          onClick={handleInvite}
          disabled={
            !formState.fullName.trim() ||
            !formState.email.trim() ||
            formState.saving
          }
          className="min-w-[100px]"
        >
          {formState.saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Inviting
            </span>
          ) : (
            "Send Invite"
          )}
        </Button>
      </div>
    </div>
  );
}

export default InviteUserForm;
