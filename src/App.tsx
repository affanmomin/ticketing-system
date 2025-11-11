import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Dashboard } from "./pages/Dashboard";
import { Tickets } from "./pages/Tickets";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Settings } from "./pages/Settings";
import { Clients } from "./pages/Clients";
import { Users } from "./pages/Users";
import { UserActivity } from "./pages/UserActivity";
import { Toaster } from "./components/ui/sonner";
import { Toaster as ShadcnToaster } from "./components/ui/toaster";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types/api";

const DEFAULT_ROUTE_BY_ROLE: Record<UserRole, string> = {
  ADMIN: "/dashboard",
  EMPLOYEE: "/tickets",
  CLIENT: "/tickets",
};

function getDefaultRoute(role?: UserRole): string {
  if (!role) return "/dashboard";
  return DEFAULT_ROUTE_BY_ROLE[role] ?? "/dashboard";
}

const LOADING_MESSAGES = [
  "Preparing your workspace...",
  "Almost there...",
  "Getting things ready...",
  "Just a moment...",
  "Setting things up...",
];

function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8">
        {/* Fancy Multi-Ring Spinner with Gradient Effect */}
        <div className="relative w-24 h-24">
          {/* Outer ring - slow spin */}
          <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin-slow"></div>

          {/* Middle ring - reverse spin */}
          <div className="absolute inset-3 border-4 border-primary/15 rounded-full"></div>
          <div className="absolute inset-3 border-4 border-transparent border-r-primary rounded-full animate-spin-reverse"></div>

          {/* Inner ring - fast spin */}
          <div className="absolute inset-6 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-6 border-4 border-transparent border-b-primary rounded-full animate-spin"></div>

          {/* Center pulsing dot with glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse-glow"></div>
              <div className="absolute inset-0 w-4 h-4 bg-primary/30 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>

        {/* Animated dots with staggered bounce */}
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0s", animationDuration: "1.4s" }}
          ></div>
          <div
            className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s", animationDuration: "1.4s" }}
          ></div>
          <div
            className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.4s", animationDuration: "1.4s" }}
          ></div>
        </div>

        {/* Rotating message with fade transition */}
        <div
          key={messageIndex}
          className="text-muted-foreground text-sm font-medium transition-all duration-500 ease-in-out"
          style={{
            animation: "fadeIn 0.5s ease-in-out",
          }}
        >
          {LOADING_MESSAGES[messageIndex]}
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) {
  const { isAuthenticated, loading, user } = useAuthStore();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, token, isAuthenticated, loading, bootstrap } = useAuthStore();
  useEffect(() => {
    if (token && !user) {
      bootstrap().catch(() => {
        // handled globally by axios interceptor
      });
    }
  }, [token, user, bootstrap]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute(user?.role)} replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute(user?.role)} replace />
          ) : (
            <Signup />
          )
        }
      />

      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute(user?.role)} replace />
          ) : (
            <ForgotPassword />
          )
        }
      />

      <Route
        path="/reset-password"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute(user?.role)} replace />
          ) : (
            <ResetPassword />
          )
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<Navigate to={getDefaultRoute(user?.role)} replace />}
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute roles={["ADMIN", "EMPLOYEE"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="tickets"
          element={
            <ProtectedRoute roles={["ADMIN", "EMPLOYEE", "CLIENT"]}>
              <Tickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects"
          element={
            <ProtectedRoute roles={["ADMIN", "EMPLOYEE", "CLIENT"]}>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/:id"
          element={
            <ProtectedRoute roles={["ADMIN", "EMPLOYEE", "CLIENT"]}>
              <ProjectDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute roles={["ADMIN", "EMPLOYEE", "CLIENT"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="clients"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="users/:userId/activity"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <UserActivity />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to={getDefaultRoute(user?.role)} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRoutes />
        <Toaster />
        <ShadcnToaster />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
