module.exports = {
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.ts", "!src/types/*.ts", "!**/node_modules/**"],
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    globals: {
      "ts-jest": {
        isolatedModules: true,
      },
    },
    preset: "ts-jest",
    testPathIgnorePatterns: ["/node_modules/", "/lib/"],
    testRegex: "\\.test\\.(ts|tsx|js)$",
    transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],
    watchPathIgnorePatterns: ["/node_modules/"],
  };