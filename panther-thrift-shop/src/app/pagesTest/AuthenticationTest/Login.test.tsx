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
