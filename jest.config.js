/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  preset: 'ts-jest',
  transform: {
    '.*\\.ts$': ['ts-jest', { 
      tsconfig: 'tsconfig.client.json'
    }]
  },
  testMatch: ['**/*.test.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^lit-html$': '<rootDir>/__mocks__/lit-html.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@silexlabs/grapesjs-data-source)/)'
  ]
}
