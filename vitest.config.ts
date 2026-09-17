import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["modules/**/test/**/*.test.ts"],
  },
});
