/** @type {import('jest').Config} */
module.exports = {
  roots: [
    '<rootDir>/src'
  ],
  testMatch: ['**/?(*.)+(test).mjs'],
  // see https://jestjs.io/docs/ecmascript-modules
  transform: {},
};
