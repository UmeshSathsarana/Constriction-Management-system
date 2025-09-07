import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended, // Base JavaScript rules
  {
    files: ['/*.js', '/*.jsx'], // Apply to JS and JSX files
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        browser: true,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off', // Disable prop-types if not used
      'no-unused-vars': 'warn', // Example: Warn on unused variables
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },
];
