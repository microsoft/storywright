/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: "jsdom",
  clearMocks: true,
  transform: {
    "^.+\\.(t|j)s$": ["@swc/jest"],
  },
  transformIgnorePatterns: ["/node_modules/"],
  // REF: https://github.com/swc-project/jest#q--a
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testMatch: ["<rootDir>/**/?(*.)(spec|test).(ts|js)"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
};
