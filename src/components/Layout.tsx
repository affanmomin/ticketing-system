import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Outlet } from "react-router-dom";
import { CommandPalette } from "./CommandPalette";

interface LayoutProps {
  title?: string;
}

export function Layout({ title }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
