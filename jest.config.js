/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  snapshotSerializers: ['./__tests__/json-serializer.js'],
  testRegex: '.test.ts$',
  coveragePathIgnorePatterns: ['__tests__/'],
};
