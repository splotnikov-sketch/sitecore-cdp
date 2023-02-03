/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@root/(.*)': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['node_modules', 'dist'],
}
