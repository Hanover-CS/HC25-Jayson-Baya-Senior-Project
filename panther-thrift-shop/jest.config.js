/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "jest-environment-jsdom",
    transform: {
        "^.+\\.(ts|tsx|js|jsx)$": "babel-jest", // Use babel-jest for JSX transformation
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^firebase/auth$": "<rootDir>/src/__mocks__/firebase/auth.ts",
    },
    setupFilesAfterEnv: ["<rootDir>/setupTests.ts"], // Setup file for testing utilities
    transformIgnorePatterns: ["<rootDir>/node_modules/"], // Ignore transformation for node_modules
};
