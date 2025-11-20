import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Outlet } from "react-router-dom";
import { CommandPalette } from "./CommandPalette";
import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface LayoutProps {
  title?: string;
}

export function Layout({ title }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persist collapsed state for production readiness
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved != null) {
      setSidebarCollapsed(saved === "true");
    }
  }, []);

  // Save to localStorage whenever sidebar state changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex relative">
        <Sidebar
          collapsed={sidebarCollapsed}
          isMobile={false}
          onToggle={toggleSidebar}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title={title}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 sm:w-72">
          <Sidebar collapsed={false} isMobile={true} />
        </SheetContent>
      </Sheet>
      <CommandPalette />
    </div>
  );
}
