import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignupForm } from "@/components/forms/SignupForm";
import { useAuthStore } from "@/store/auth";

export function Signup() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-sm p-8">
          <SignupForm
            onSuccess={() => {
              navigate("/");
            }}
          />

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
