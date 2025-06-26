module.exports = [
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  }
];
