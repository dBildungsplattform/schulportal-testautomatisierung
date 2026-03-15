import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';

export default tseslint.config(
  // Ignore folders
  {
    ignores: ['node_modules', 'base/api/generated', 'playwright-report', 'test-results'],
  },

  // JS base rules
  js.configs.recommended,

  // TypeScript rules for all TS files
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    extends: [...tseslint.configs.recommended, ...tseslint.configs.stylistic],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-param-reassign': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Playwright rules only for tests
  {
    files: ['tests/**/*.ts'],
    plugins: {
      playwright,
    },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-conditional-in-test': 'off',
      'playwright/expect-expect': 'off',
      'no-console': 'off',
      // Return types on test callbacks are noisy and add no value
      '@typescript-eslint/explicit-function-return-type': 'off',
      'playwright/valid-title': 'off',
    },
  },
);
