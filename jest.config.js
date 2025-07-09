module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/apps/server", "<rootDir>/subscription-server"],
  globals: {
    "ts-jest": { tsconfig: "<rootDir>/tsconfig.json" },
  },
};
