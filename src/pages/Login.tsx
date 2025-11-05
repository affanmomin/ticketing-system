import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/hooks/use-toast";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, error, clearError } = useAuthStore();

  // Auto-fill credentials from URL parameter
  useEffect(() => {
    const credsParam = searchParams.get("creds");
    if (credsParam) {
      try {
        // Decode the base64 encoded JSON
        const decodedCreds = atob(credsParam);
        console.log("Decoded credentials string:", decodedCreds);
        const credentials = JSON.parse(decodedCreds);
        console.log("Parsed credentials:", {
          email: credentials.email,
          password: "***",
        });

        if (credentials.email && credentials.password) {
          setEmail(credentials.email);
          setPassword(credentials.password);
          toast({
            title: "Credentials loaded",
            description: `Auto-filled: ${credentials.email}. Click Sign In to continue.`,
          });
        } else {
          console.error(
            "Missing email or password in credentials:",
            credentials
          );
          toast({
            title: "Invalid credentials",
            description: "The credentials are missing email or password.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to decode credentials:", error);
        toast({
          title: "Invalid credentials link",
          description: "The credentials in the link are malformed.",
          variant: "destructive",
        });
      }
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, clearError, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug: Log the credentials being used
    console.log("Login attempt with:", {
      email,
      password: "***",
    });

    try {
      setLoading(true);
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      const message = err?.response?.data?.message || "Login failed";
      toast({
        title: "Authentication error",
        description: `${message} (Email: ${email})`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Ticketly</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Demo Accounts:
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Admin: admin@acme.com / adminpassword</p>
              <p>Employee: employee@example.com / password</p>
              <p>Client: client@example.com / password</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an organization?{" "}
              <a
                href="/signup"
                className="text-primary hover:underline font-medium"
              >
                Create one
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
