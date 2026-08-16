import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// App version comes from git so it stays in sync with the repo tags.
// Without a .git dir (e.g. a source archive), fall back to package.json version.
function appVersion(): string {
  try {
    const v = execSync("git describe --tags --always --dirty", { encoding: "utf8" }).trim();
    return v.startsWith("v") ? v.slice(1) : v;
  } catch {
    try {
      const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
      return pkg.version || "0.1.0";
    } catch {
      return "0.1.0";
    }
  }
}

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
  },
  root: ".",
  server: {
    port: 5173,
    proxy: {
      // Point the template at a backend API server on :8000.
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
