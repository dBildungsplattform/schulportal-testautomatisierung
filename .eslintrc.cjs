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
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser'
  },
  rules: {
    // 'prettier/prettier': ['warn'],
    // 'import/no-extraneous-dependencies': ['error', { devDependencies: false }],
    // 'import/no-cycle': ['error'],
    // ...typescriptConfigs.recommended.rules,
    // ...playwright.configs['flat/recommended'].rules
    'no-void': ['error', { allowAsStatement: true }],
    'no-console': ['warn'],
    'max-classes-per-file': ['error', 1],
    'class-methods-use-this': 'off',
    'no-param-reassign': 'warn',
    'no-underscore-dangle': 'error',
    '@typescript-eslint/no-inferrable-types': ['off'],
    '@typescript-eslint/typedef': [
      'warn',
      {
        arrayDestructuring: true,
        arrowParameter: true,
        memberVariableDeclaration: true,
        objectDestructuring: true,
        parameter: true,
        propertyDeclaration: true,
        variableDeclaration: true,
        variableDeclarationIgnoreFunction: true
      }
    ],
    // '@typescript-eslint/unbound-method': 'error',
    // '@typescript-eslint/explicit-member-accessibility': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '_.+' }],
    // "@typescript-eslint/no-unnecessary-condition": "error",
    '@typescript-eslint/no-empty-interface': [
      'error',
      {
        allowSingleExtends: true
      }
    ],

    // currently disabled rules - TODO: fix them
    'playwright/no-conditional-in-test': 'off'
  }
}