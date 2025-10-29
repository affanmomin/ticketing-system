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
import { toast } from "@/hooks/use-toast";
import * as usersApi from "@/api/users";
import * as clientsApi from "@/api/clients";
import type { User, UserType } from "@/api/users";

export function UserEditForm({
  user,
  onSuccess,
}: {
  user: User;
  onSuccess?: () => void;
}) {
  const [formState, setFormState] = useState({
    name: user.name,
    email: user.email,
    password: "",
    userType: user.userType,
    clientCompanyId: user.clientCompanyId || "",
    active: user.active,
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

  async function handleUpdate() {
    if (!formState.name.trim() || !formState.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    if (formState.password && formState.password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      const updateData: any = {
        name: formState.name,
        email: formState.email,
        userType: formState.userType,
        clientCompanyId: formState.clientCompanyId || undefined,
        active: formState.active,
      };

      if (formState.password) {
        updateData.password = formState.password;
      }

      await usersApi.update(user.id, updateData);
      toast({
        title: "User updated",
        description: `${formState.name} has been successfully updated`,
      });
      onSuccess?.();
    } catch (e: any) {
      toast({
        title: "Failed to update user",
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
        <h2 className="text-xl font-semibold tracking-tight">Edit User</h2>
        <p className="text-sm text-muted-foreground">
          Update user information and permissions
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Name & Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="user-name" className="text-sm font-medium">
              Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="user-name"
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
            <Label htmlFor="user-email" className="text-sm font-medium">
              Email
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="user-email"
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
            <Label htmlFor="user-password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="user-password"
              type="password"
              placeholder="Leave blank to keep current"
              value={formState.password}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, password: e.target.value }))
              }
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep current password
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-type" className="text-sm font-medium">
              User Type
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              value={formState.userType}
              onValueChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  userType: v as UserType,
                }))
              }
            >
              <SelectTrigger id="user-type" className="w-full h-10">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="CLIENT">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Client Company */}
        <div className="space-y-2">
          <Label htmlFor="user-client" className="text-sm font-medium">
            Client Company
          </Label>
          <Select
            value={formState.clientCompanyId || "none"}
            onValueChange={(v) =>
              setFormState((prev) => ({
                ...prev,
                clientCompanyId: v === "none" ? "" : v,
              }))
            }
          >
            <SelectTrigger id="user-client" className="w-full h-10">
              <SelectValue placeholder="Select client (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Optional - assign user to a client organization
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="space-y-0.5">
            <Label htmlFor="user-active" className="text-sm font-medium">
              Active Status
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable or disable this user account
            </p>
          </div>
          <Switch
            id="user-active"
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
          onClick={handleUpdate}
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
              Updating
            </span>
          ) : (
            "Update User"
          )}
        </Button>
      </div>
    </div>
  );
}

export default UserEditForm;
