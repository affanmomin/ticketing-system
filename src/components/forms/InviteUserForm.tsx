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

export function InviteUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    userType: "EMPLOYEE" as "ADMIN" | "EMPLOYEE" | "CLIENT",
    clientCompanyId: "",
    active: true,
    saving: false,
  });
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    []
  );

  useEffect(() => {
    (async () => {
      try {
        const { data } = await clientsApi.list({ limit: 200, offset: 0 });
        setClients(data.items.map((c) => ({ id: c.id, name: c.name })));
      } catch (e) {
        console.error("Failed to load clients:", e);
      }
    })();
  }, []);

  async function handleInvite() {
    if (
      !formState.name.trim() ||
      !formState.email.trim() ||
      !formState.password.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Name, email, and password are required",
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

    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      await usersApi.create({
        name: formState.name,
        email: formState.email,
        password: formState.password,
        userType: formState.userType,
        clientCompanyId: formState.clientCompanyId || undefined,
        active: formState.active,
      });
      toast({
        title: "User invited",
        description: `${formState.name} has been successfully invited`,
      });
      onSuccess?.();
    } catch (e: any) {
      toast({
        title: "Failed to invite user",
        description: e?.response?.data?.message || "An error occurred",
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
              Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="invite-name"
              placeholder="Enter full name"
              value={formState.name}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, name: e.target.value }))
              }
              aria-required="true"
              className="h-10"
            />
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
              User Type
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              value={formState.userType}
              onValueChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  userType: v as "ADMIN" | "EMPLOYEE" | "CLIENT",
                }))
              }
            >
              <SelectTrigger id="invite-user-type" className="w-full h-10">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="CLIENT">Client</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Determines user permissions and access
            </p>
          </div>
        </div>

        {/* Client Company (conditional) */}
        {formState.userType === "CLIENT" && (
          <div className="space-y-2">
            <Label htmlFor="invite-client" className="text-sm font-medium">
              Client Company
            </Label>
            <Select
              value={formState.clientCompanyId}
              onValueChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  clientCompanyId: String(v),
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
          disabled={formState.saving}
          className="min-w-[80px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleInvite}
          disabled={
            !formState.name.trim() ||
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
