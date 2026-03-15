import js from "@eslint/js";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";

export default [
  {
    ignores: [
      "node_modules",
      "base/api/generated",
      "playwright-report",
      "test-results"
    ]
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  {
    files: ["tests/**/*.{ts,tsx}"],
    ...playwright.configs["flat/recommended"]
  },

  {
    rules: {
      "no-console": "warn",
      "no-param-reassign": "warn",

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "error",

      "playwright/no-conditional-in-test": "off",
      "playwright/expect-expect": "off"
    }
  }
];
