// Frontend-specific ESLint config: React + TypeScript best practices.
module.exports = {
  extends: ['../../.eslintrc.cjs', 'plugin:react/recommended'],
  plugins: ['react'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off'
  }
};
