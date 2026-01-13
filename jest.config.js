module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    // Transform Three.js ESM modules
    '^.+\\.js$': 'babel-jest',
  },
  // Allow transforming Three.js examples
  transformIgnorePatterns: [
    'node_modules/(?!(three)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/main.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock Three.js for tests that don't need actual 3D
    '^three$': '<rootDir>/tests/__mocks__/three.ts',
    '^three/examples/jsm/(.*)$': '<rootDir>/tests/__mocks__/three-examples.ts',
  },
  testTimeout: 10000,
};
