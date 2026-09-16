import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        "pure/numbers/clamp": resolve(
          import.meta.dirname,
          "src/pure/numbers/clamp.ts",
        ),
        "pure/numbers/numbersFromSeed": resolve(
          import.meta.dirname,
          "src/pure/numbers/numbersFromSeed.ts",
        ),
        // Add new entries above this comment
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    sourcemap: true,
  },
});
