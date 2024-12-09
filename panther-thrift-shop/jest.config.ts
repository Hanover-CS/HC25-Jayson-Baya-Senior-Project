import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "jest-environment-jsdom",
    transform: {
        "^.+\\.(ts|tsx|js|jsx)$": "babel-jest", // Use babel-jest for JSX transformation
    },
    moduleNameMapper: {
        "^firebase/auth$": "<rootDir>/src/__mocks__/firebase/auth.ts",
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    setupFilesAfterEnv: ["<rootDir>/setupTests.ts"], // Setup file for testing utilities
    transformIgnorePatterns: ["<rootDir>/node_modules/"], // Ignore transformation for node_modules
};

export default config;
