export default {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/backend/**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['**/backend/**/*.{ts,tsx}'],
  coverageDirectory: 'coverage',
  coverageReporters: [['text', { file: 'coverage.txt' }]],
  coverageProvider: 'v8',
};
