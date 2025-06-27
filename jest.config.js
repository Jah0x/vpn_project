module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/server", "<rootDir>/subscription-server"],
  globals: {
    "ts-jest": { tsconfig: "<rootDir>/tsconfig.json" },
  },
};
