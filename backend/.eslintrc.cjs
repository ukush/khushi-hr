// Backend ESLint: Node + TypeScript rules
module.exports = {
  extends: ['../../.eslintrc.cjs'],
  env: {
    node: true
  },
  rules: {
    // Backend can use console for logging during development
    'no-console': 'off'
  }
};
