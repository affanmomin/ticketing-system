import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  preview: {
    // Ensure SPA routing works in preview mode
    // This serves index.html for all routes
  },
  server: {
    // Ensure SPA routing works in dev mode
    // Vite handles this automatically, but explicit config helps
  },
});
