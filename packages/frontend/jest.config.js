const nextJest = require('next/jest')
 
/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  dir: './',
})
 
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Hoisted test utilities must resolve the frontend workspace's React installation.
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
}
 
module.exports = createJestConfig(config)