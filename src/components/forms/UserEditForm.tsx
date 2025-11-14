import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import * as usersApi from "@/api/users";
import type { AuthUser } from "@/types/api";
import {
  getEmailError,
  getNameError,
} from "@/lib/validations";

interface UserEditFormProps {
  user: AuthUser;
  onSuccess?: () => void;
}

export function UserEditForm({ user, onSuccess }: UserEditFormProps) {
  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(user.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
  }>({});

  async function handleUpdate() {
    // Validate all fields
    const newErrors: { fullName?: string; email?: string } = {};
    
    if (fullName.trim()) {
      const nameError = getNameError(fullName, "Full name");
      if (nameError) newErrors.fullName = nameError;
    }
    
    const emailError = getEmailError(email);
    if (emailError) newErrors.email = emailError;
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Validation error",
        description: Object.values(newErrors)[0] || "Please fix the errors",
        variant: "destructive",
      });
      return;
    }

    if (password && password.length < 8) {
      toast({
        title: "Validation error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await usersApi.update(user.id, {
        fullName: fullName.trim() || undefined,
        email: email.trim(),
        isActive,
      });

      if (password) {
        await usersApi.changePassword(user.id, { password });
      }

      toast({ title: "User updated" });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Failed to update user",
        description: error?.response?.data?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Edit User</h2>
        <p className="text-sm text-muted-foreground">
          Update core contact details and activation state
        </p>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-full-name">Full name</Label>
          <Input
            id="user-full-name"
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value);
              if (errors.fullName) {
                setErrors((prev) => ({ ...prev, fullName: undefined }));
              }
            }}
            placeholder="Full name (optional)"
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            type="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder="user@example.com"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-password">Reset password</Label>
          <Input
            id="user-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Leave blank to keep existing password"
          />
          <p className="text-xs text-muted-foreground">
            Minimum 8 characters. Leave empty to keep the current password.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
          <div className="space-y-0.5">
            <Label htmlFor="user-active" className="text-sm font-medium">
              Active status
            </Label>
            <p className="text-xs text-muted-foreground">
              Inactive accounts cannot log in to the platform.
            </p>
          </div>
          <Switch
            id="user-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onSuccess} disabled={saving}>
          Close
        </Button>
        <Button
          onClick={handleUpdate}
          disabled={
            !email.trim() ||
            saving ||
            Object.keys(errors).length > 0
          }
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

export default UserEditForm;
