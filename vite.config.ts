import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const LOVABLE_CLOUD_URL = "https://jypjttotvastdhanwvrx.supabase.co";
const LOVABLE_CLOUD_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Imp5cGp0dG90dmFzdGRoYW53dnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTQ5MTQsImV4cCI6MjA3ODY3MDkxNH0.fVSXHJ_eqvMfblTD2SbNcYDrkulhqVCzv_7dXMenKc8";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL || LOVABLE_CLOUD_URL,
    ),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || LOVABLE_CLOUD_PUBLISHABLE_KEY,
    ),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
