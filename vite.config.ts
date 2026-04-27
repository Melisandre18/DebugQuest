import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { Plugin, Connect } from "vite";
import type { ServerResponse } from "http";

// Dev-only plugin: routes /api/* requests to the handler modules in api/
function apiDevPlugin(): Plugin {
  return {
    name: "api-dev-plugin",
    configureServer(server) {
      server.middlewares.use(async (req: Connect.IncomingMessage, res: ServerResponse, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/")) return next();

        const pathname = url.split("?")[0]; // e.g. "/api/puzzles"

        // Route table
        const routes: Record<string, () => Promise<{ default: Function }>> = {
          "/api/puzzles":       () => import("./api/puzzles.js"),
          "/api/puzzle":        () => import("./api/puzzle.js"),
          "/api/next-puzzle":   () => import("./api/next-puzzle.js"),
          "/api/puzzle-counts": () => import("./api/puzzle-counts.js"),
          "/api/health":        () => import("./api/health.js"),
          "/api/feedback":      () => import("./api/feedback.js"),
        };

        const loader = routes[pathname];
        if (!loader) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: "api route not found" }));
          return;
        }

        try {
          const mod = await loader();
          await mod.default(req, res);
        } catch (err) {
          console.error("[api-dev]", err);
          res.writeHead(500);
          res.end(JSON.stringify({ error: "internal server error" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && apiDevPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime",
      "@tanstack/react-query", "@tanstack/query-core",
    ],
  },
}));
