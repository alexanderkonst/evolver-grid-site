import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

const LOVABLE_CLOUD_URL = "https://jypjttotvastdhanwvrx.supabase.co";
const LOVABLE_CLOUD_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cGp0dG90dmFzdGRoYW53dnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTQ5MTQsImV4cCI6MjA3ODY3MDkxNH0.fVSXHJ_eqvMfblTD2SbNcYDrkulhqVCzv_7dXMenKc8";

/** Serve and emit the standalone Commercial OS without keeping a second copy. */
const commercialOsAssets = () => {
  const sourceRoot = path.resolve(__dirname, "commercial-tools/app");
  const files = (dir = sourceRoot): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? files(absolute) : [absolute];
  });
  const mime: Record<string, string> = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8" };
  return {
    name: "commercial-os-assets",
    configureServer(server) {
      server.middlewares.use("/commercial-os", (request, response, next) => {
        const requested = decodeURIComponent((request.url || "/").split("?")[0]);
        const relative = requested === "/" ? "index.html" : requested.replace(/^\//, "");
        const absolute = path.resolve(sourceRoot, relative);
        if (!absolute.startsWith(sourceRoot + path.sep) || !fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) return next();
        response.setHeader("Content-Type", mime[path.extname(absolute)] || "application/octet-stream");
        fs.createReadStream(absolute).pipe(response);
      });
    },
    generateBundle() {
      for (const absolute of files()) {
        const relative = path.relative(sourceRoot, absolute).split(path.sep).join("/");
        this.emitFile({ type: "asset", fileName: `commercial-os/${relative}`, source: fs.readFileSync(absolute) });
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mcpPlugin(), commercialOsAssets(), mode === "development" && componentTagger()].filter(Boolean),
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
