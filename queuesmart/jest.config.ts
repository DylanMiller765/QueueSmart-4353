import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  transform: { "^.+\\.tsx?$": ["ts-jest", {}] },
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  setupFiles: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "src/lib/serviceStore.ts",
    "src/lib/auth.ts",
    "src/lib/validations.ts",
    "src/lib/supabase.ts",
    "src/lib/queueStore.ts",
    "src/app/api/auth/*/route.ts",
    "src/app/api/queue/status/route.ts",
  ],
};

export default config;