/* eslint-disable no-unused-vars */
const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'semistandard',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'comma-dangle': OFF,
    'space-before-function-paren': OFF,
    'no-console': ERROR,
    'no-multiple-empty-lines': [ERROR, { max: 2 }],
    'import/no-duplicates': OFF,
    'quote-props': OFF,
    'operator-linebreak': OFF,

    // Handled by typescript
    'no-redeclare': OFF,
    'no-unused-vars': OFF,
    'no-undef': OFF,
  },
};
