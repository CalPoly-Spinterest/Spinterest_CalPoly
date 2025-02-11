export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {}],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**/*.{ts,tsx}'],
  coverageDirectory: 'coverage',
  coverageReporters: [['text', { file: 'coverage.txt' }]],
  coverageProvider: 'v8',
};
