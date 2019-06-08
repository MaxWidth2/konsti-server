module.exports = {
  extends: [
    'standard',
    'plugin:jest/recommended',
    // 'plugin:security/recommended',
    'plugin:flowtype/recommended',
    // 'plugin:node/recommended',
    // 'plugin:promise/recommended',
    // 'plugin:unicorn/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:eslint-plugin/recommended',
    'prettier',
    'prettier/flowtype',
    'prettier/standard',
  ],
  plugins: [
    'flowtype',
    'prettier',
    'standard',
    'security',
    'node',
    'promise',
    'unicorn',
    'eslint-plugin',
    'jest',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    impliedStrict: true,
  },
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'prettier/prettier': 'error',
    'node/no-unsupported-features/es-syntax': 'off', // Import and export declarations are not supported yet
  },
}
