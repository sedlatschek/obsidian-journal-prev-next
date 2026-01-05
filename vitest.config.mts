import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      src: resolve("./src"),
      obsidian: resolve(__dirname, "./test/obsidian.ts"),
    },
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    globals: true,
    server: { deps: { inline: ["obsidian"] } },
    setupFiles: resolve(__dirname, "./test/setup.ts"),
  },
});
