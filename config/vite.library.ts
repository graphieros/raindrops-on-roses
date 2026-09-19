import { resolve } from "node:path";

import { defineConfig } from "vite";

export function createLibraryConfig(directory: string) {
  return defineConfig({
    build: {
      lib: {
        entry: resolve(directory, "src/index.ts"),
        formats: ["es"],
        fileName: "index",
      },
      rollupOptions: {
        external: (id) => id.startsWith("@raindropsonroses/"),
      },
      sourcemap: true,
      emptyOutDir: false,
    },
  });
}
