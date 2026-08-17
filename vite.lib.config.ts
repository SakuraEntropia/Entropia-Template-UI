import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

// Library build for npm publishing. Produces ESM + a single CSS file + (via
// tsc) type declarations in `dist/`, with React / React DOM / @xyflow/react /
// zustand left external so the consumer supplies them.
function pkgVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));
    return pkg.version || "0.1.0";
  } catch {
    return "0.1.0";
  }
}

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  define: {
    __APP_VERSION__: JSON.stringify(pkgVersion()),
  },
  build: {
    lib: {
      entry: resolve(process.cwd(), "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "@xyflow/react", "zustand"],
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
