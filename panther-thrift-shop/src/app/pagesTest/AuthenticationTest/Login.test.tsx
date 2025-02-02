/**
 * login.test.tsx
 *
 * This file contains unit tests for the Login component of the Panther Thrift Shop web application,
 * using React Testing Library and Jest. The tests verify that the Login component behaves as expected,
 * including rendering the login form, handling authentication errors, and redirecting after a successful login.
 *
 * Key Features Tested:
 * - **Form Rendering:** Ensures the login form displays email and password inputs along with a login button.
 * - **Error Handling:** Simulates a failed login attempt by mocking a rejected Firebase authentication promise,
 *   and verifies that an appropriate error message ("User is not registered!") is displayed.
 * - **Successful Login and Redirection:** Mocks a successful login attempt by resolving the Firebase authentication
 *   promise and verifies that a success message is displayed and that the user is redirected to the Browse Page.
 *
 * Mocks:
 * - Firebase Authentication's `signInWithEmailAndPassword` function is mocked to simulate both success and failure scenarios.
 * - Next.js' `useRouter` hook is mocked to monitor and assert the redirection behavior (using `router.push`).
 *
 * Dependencies:
 * - `@testing-library/react` for rendering components and simulating user interactions.
 * - `@testing-library/jest-dom` for extended DOM assertions.
 * - Firebase Auth functions and Next.js navigation hooks are mocked to isolate component behavior.
 *
 * Author: Jayson Baya
 * Last Updated: January 25, 2025
 */


import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "@/app/pages/Login/page";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

// Mock Firebase and useRouter
jest.mock("firebase/auth", () => ({
    signInWithEmailAndPassword: jest.fn(),
    getAuth: jest.fn(() => ({})),
}));

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

describe("Login Component", () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        jest.clearAllMocks();
    });

    it("renders the login form", () => {
        render(<Login />);
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(screen.getByText("Log In")).toBeInTheDocument();
    });

    it("displays an error message when login fails", async () => {
        (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(new Error("Login failed"));

        render(<Login />);

        // Simulate user input
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" },
        });

        // Click the login button
        fireEvent.click(screen.getByText("Log In"));

        // Wait for the error message to appear
        await waitFor(() => {
            expect(screen.getByText("User is not registered!")).toBeInTheDocument();
        });
    });

    it("redirects to BrowsePage after successful login", async () => {
        (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({});

        render(<Login />);

        // Simulate user input
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" },
        });

        // Click the login button
        fireEvent.click(screen.getByText("Log In"));

        // Wait for the success message and redirection
        await waitFor(() => {
            expect(screen.getByText("User successfully logged in!")).toBeInTheDocument();
            expect(mockPush).toHaveBeenCalledWith("/pages/BrowsePage");
        });
    });
});
