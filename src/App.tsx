import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
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
import { useEffect } from "react";
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

function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) {
  const { isAuthenticated, loading, user } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
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
