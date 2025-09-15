module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'n8n-nodes-base'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:n8n-nodes-base/nodes',
  ],
  rules: {
    'n8n-nodes-base/node-dirname-against-convention': 'error',
    'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'error',
    'n8n-nodes-base/node-class-description-outputs-wrong': 'error',
    'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'error',
    'n8n-nodes-base/node-class-description-missing-subtitle': 'error',
    'n8n-nodes-base/node-class-description-icon-not-svg': 'error',
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  env: {
    es6: true,
    node: true,
  },
  ignorePatterns: ['package.json'],
};
