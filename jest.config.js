module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts'],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/config/*",
  ]
};