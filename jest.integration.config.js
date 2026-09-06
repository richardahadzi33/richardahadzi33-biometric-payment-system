const { createDefaultPreset } = require('ts-jest');

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    ...createDefaultPreset().transform,
  },
  testMatch: ['<rootDir>/src/tests/**/*.integration.test.ts'],
  setupFiles: ['<rootDir>/src/tests/setupIntegration.ts'],
  maxWorkers: 1,
};
