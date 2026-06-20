import path from "node:path";
import { defineConfig } from "vitest/config";

// Specs cover the pure libs only (no react-native in their import graph), so a
// plain node environment is enough. The `@` alias mirrors tsconfig's `@/* → ./*`.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    environment: "node",
    include: ["**/*.spec.ts"],
  },
});
