/* eslint-disable no-unused-vars */
const OFF = 0;
const WARN = 1;
const ERROR = 2;
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  overrides: [
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/semi': [ERROR, 'always'],
    '@typescript-eslint/comma-dangle': OFF,
    '@typescript-eslint/member-delimiter-style': OFF,
    '@typescript-eslint/consistent-indexed-object-style': OFF,
    '@typescript-eslint/explicit-function-return-type': OFF,
    '@typescript-eslint/strict-boolean-expressions': OFF,
    '@typescript-eslint/space-before-function-paren': [ERROR, {
      'anonymous': 'never',
      'named': 'never',
      'asyncArrow': 'always'
    }],
    '@typescript-eslint/restrict-template-expressions': OFF,
    '@typescript-eslint/restrict-plus-operands': [ERROR, {
      checkCompoundAssignments: false,
      allowAny: true
    }],
    '@typescript-eslint/consistent-type-assertions': OFF,
    '@typescript-eslint/consistent-type-definitions': OFF,
    '@typescript-eslint/prefer-optional-chain': OFF,
    '@typescript-eslint/no-unnecessary-type-assertion': OFF,
    
    'no-console': ERROR,
    'no-multiple-empty-lines': [ERROR, { max: 2 }],
    'import/no-duplicates': OFF,
    'quote-props': OFF,
    'operator-linebreak': OFF,
    'no-use-before-define': OFF,

    // Handled by typescript
    'semi': OFF,
    'comma-dangle': OFF,
    'space-before-function-paren': OFF,
    'no-redeclare': OFF,
    'no-unused-vars': OFF,
    'no-undef': OFF,
  },
};
