// jest.config.js
// Sync object
module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coveragePathIgnorePatterns: ['/node_modules/'],
  errorOnDeprecated: true,
  testPathIgnorePatterns: ["/node_modules/"],
  verbose: true,
};
