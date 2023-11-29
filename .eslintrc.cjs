/* eslint-env node */
module.exports = {
  extends: [
  'eslint:recommended', 
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/stylistic',
  'plugin:playwright/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  parserOptions: {
    sourceType: 'module'
  }
}