// jest.config.js
module.exports = {
    preset: "ts-jest",
    testEnvironment: "jest-environment-jsdom",
    transform: {
        "^.+\\.(ts|tsx|js|jsx)$": "babel-jest", // Use babel-jest for JSX transformation
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
    transformIgnorePatterns: ["<rootDir>/node_modules/"],
};
