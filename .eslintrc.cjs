// Root ESLint config. It sets up shared rules and TypeScript parser options
// and delegates env-specific rules to package-level configs where needed.
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Keep root rules conservative. Package-level configs can extend/override.
    'no-console': 'warn'
  }
};
