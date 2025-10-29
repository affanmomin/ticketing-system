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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Edit User</h2>
        <p className="text-sm text-muted-foreground">Update user information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Name{" "}
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
          <Label>
            Email{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
          </Label>
          <Input
            type="email"
            value={formState.email}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, email: e.target.value }))
            }
            aria-required="true"
          />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            value={formState.password}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="Leave blank to keep current password"
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to keep current password
          </p>
        </div>

        <div className="space-y-2">
          <Label>
            User Type{" "}
            <span aria-hidden className="text-red-400">
              *
            </span>
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
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="EMPLOYEE">Employee</SelectItem>
              <SelectItem value="CLIENT">Client</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Client Company</Label>
          <Select
            value={formState.clientCompanyId || "none"}
            onValueChange={(v) =>
              setFormState((prev) => ({
                ...prev,
                clientCompanyId: v === "none" ? "" : v,
              }))
            }
          >
            <SelectTrigger className="w-full">
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
        </div>

        <div className="md:col-span-2 flex items-center justify-between">
          <div>
            <Label>Active Status</Label>
            <p className="text-xs text-muted-foreground">
              Toggle user active status
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
          onClick={handleUpdate}
          disabled={
            !formState.name.trim() ||
            !formState.email.trim() ||
            formState.saving
          }
        >
          {formState.saving ? "Updating…" : "Update User"}
        </Button>
      </div>
    </div>
  );
}

export default UserEditForm;
