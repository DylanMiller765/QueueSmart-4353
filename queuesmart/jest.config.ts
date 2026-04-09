import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  transform: { "^.+\\.tsx?$": ["ts-jest", {}] },
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  collectCoverageFrom: [
    "src/lib/serviceStore.ts",
    "src/lib/auth.ts",
    "src/lib/validations.ts",
    "src/lib/supabase.ts",
    "src/app/api/auth/*/route.ts",
  ],
};

export default config;
