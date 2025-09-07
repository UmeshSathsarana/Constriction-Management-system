module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ]
};
