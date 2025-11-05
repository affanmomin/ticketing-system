import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import * as authApi from "@/api/auth";
import { useAuthStore } from "@/store/auth";

interface SignupFormState {
  organizationName: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  saving: boolean;
}

export function SignupForm({
  onSuccess,
}: {
  onSuccess?: (token: string) => void;
}) {
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const [formState, setFormState] = useState<SignupFormState>({
    organizationName: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    saving: false,
  });

  const [errors, setErrors] = useState<Partial<SignupFormState>>({});

  function validateForm(): boolean {
    const newErrors: Partial<SignupFormState> = {};

    if (!formState.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }

    if (!formState.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formState.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formState.password) {
      newErrors.password = "Password is required";
    } else if (formState.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSignup() {
    if (!validateForm()) return;

    setFormState((prev) => ({ ...prev, saving: true }));
    try {
      const { data } = await authApi.signup({
        organizationName: formState.organizationName.trim(),
        fullName: formState.fullName.trim(),
        email: formState.email.trim().toLowerCase(),
        password: formState.password,
      });

      setToken(data.accessToken);
      setUser(data.user);

      toast({
        title: "Success",
        description: "Organization created and logged in successfully",
      });

      onSuccess?.(data.accessToken);
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description:
          error?.response?.data?.message ||
          "Failed to create organization. Please try again.",
        variant: "destructive",
      });
      setFormState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight">Get Started</h2>
        <p className="text-sm text-muted-foreground">
          Create your organization and admin account to begin managing tickets
        </p>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-5">
        {/* Organization Name */}
        <div className="space-y-2">
          <Label
            htmlFor="org-name"
            className="text-sm font-medium"
          >
            Organization Name
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="org-name"
            placeholder="e.g., Acme Corporation"
            value={formState.organizationName}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                organizationName: e.target.value,
              }))
            }
            disabled={formState.saving}
            className="h-10"
            aria-required="true"
          />
          {errors.organizationName && (
            <p className="text-xs text-destructive">{errors.organizationName}</p>
          )}
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label
            htmlFor="signup-name"
            className="text-sm font-medium"
          >
            Full Name
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="signup-name"
            placeholder="Your full name"
            value={formState.fullName}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, fullName: e.target.value }))
            }
            disabled={formState.saving}
            className="h-10"
            aria-required="true"
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="signup-email"
            className="text-sm font-medium"
          >
            Email Address
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="admin@example.com"
            value={formState.email}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, email: e.target.value }))
            }
            disabled={formState.saving}
            className="h-10"
            aria-required="true"
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label
            htmlFor="signup-password"
            className="text-sm font-medium"
          >
            Password
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="At least 8 characters"
            value={formState.password}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, password: e.target.value }))
            }
            disabled={formState.saving}
            className="h-10"
            aria-required="true"
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label
            htmlFor="signup-confirm-password"
            className="text-sm font-medium"
          >
            Confirm Password
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="signup-confirm-password"
            type="password"
            placeholder="Confirm your password"
            value={formState.confirmPassword}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            disabled={formState.saving}
            className="h-10"
            aria-required="true"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <Button
        onClick={handleSignup}
        disabled={formState.saving}
        className="w-full h-10"
        size="lg"
      >
        {formState.saving ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Creating organization...
          </span>
        ) : (
          "Create Organization"
        )}
      </Button>
    </div>
  );
}
