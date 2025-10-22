import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Tickets } from "./pages/Tickets";
import { Projects } from "./pages/Projects";
import { Settings } from "./pages/Settings";
import { Tags } from "./pages/Tags";
import { Clients } from "./pages/Clients";
import { Users } from "./pages/Users";
import { Toaster } from "./components/ui/sonner";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

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
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="projects" element={<Projects />} />
        <Route path="settings" element={<Settings />} />
        <Route path="tags" element={<Tags />} />
        <Route path="clients" element={<Clients />} />
        <Route path="users" element={<Users />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
