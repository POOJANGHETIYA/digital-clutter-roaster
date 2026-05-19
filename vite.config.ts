import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    sourcemap: false,
    minify: "esbuild",
  },
  preview: {
    allowedHosts: ["endocrinous-foreign-darlena.ngrok-free.dev"],
    host: "localhost",
    port: 4173,
  },
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});