/**
 * signup.test.tsx
 *
 * This file contains unit tests for the SignUp component of the Panther Thrift Shop web application,
 * using React Testing Library and Jest. The tests verify that the SignUp component behaves correctly
 * under various scenarios, including successful registration using both Firestore and IndexedDB, as well as
 * handling error conditions.
 *
 * Key Features Tested:
 * - **Form Rendering:** Ensures the sign-up form displays email and password inputs along with the sign-up button.
 * - **Successful Registration (Firestore):** Simulates a successful registration when Firestore is enabled.
 *   It verifies that the success message ("You successfully registered!") is displayed and that the user
 *   is redirected to the Browse Page.
 * - **Successful Registration (IndexedDB):** Simulates a successful registration when Firestore is disabled
 *   (using IndexedDB), verifying the same success and redirection behavior.
 * - **Email Already Registered Error:** Simulates a Firebase error when the email is already in use, verifying
 *   that the appropriate error message ("Email ID already registered.") is shown and that no redirection occurs.
 * - **General Error Handling:** Tests the display of a general error message when an unknown error occurs during registration.
 *
 * Mocks:
 * - Firebase Authentication's `createUserWithEmailAndPassword` is mocked to simulate both successful and failing scenarios.
 * - Firestore functions such as `setDoc` are mocked when Firestore mode is enabled.
 * - The IndexedDB helper function `addData` is mocked to simulate local data storage.
 * - Next.js' `useRouter` hook is mocked to monitor redirection behavior via `router.push`.
 *
 * Dependencies:
 * - `@testing-library/react` for component rendering and simulating user interactions.
 * - `@testing-library/jest-dom` for extended DOM assertions.
 * - Firebase Authentication, Firestore, and Storage modules are mocked to isolate component behavior.
 *
 * Author: Jayson Baya
 * Last Updated: January 25, 2025
 */


import React from "react"
import { FirebaseError } from "@firebase/app";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import SignUp from "@/app/pages/SignUp/page";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {addData} from "@/lib/dbHandler";

jest.mock("@/lib/firebaseConfig", () => ({
    auth: {},
    db: {}, // Firestore Mock
    storage: {},
}));

jest.mock("@/lib/dbHandler", () => ({
    addData: jest.fn(), // Mock IndexedDB
}));

jest.mock("firebase/app", () => ({
    initializeApp: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({})),
    createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => ({})),
    doc: jest.fn(),
    setDoc: jest.fn(),
    getDocs: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(() => ({})),
}));

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

describe("SignUp Component", () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        jest.clearAllMocks();
    });

    it("renders the sign-up form", () => {
        render(<SignUp />);
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        const signUpButton = screen.getByRole("button", { name: "Sign Up" });
        expect(signUpButton).toBeInTheDocument();
    });


    it("handles successful sign-up with Firestore", async () => {
        process.env.NEXT_PUBLIC_USE_FIRESTORE = "true"; //  Firestore mode
        render(<SignUp />);

        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const signUpButton = screen.getByRole("button", { name: "Sign Up" });

        const mockUser = { user: { uid: "12345", email: "test@hanover.edu" } };
        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUser);
        (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

        fireEvent.change(emailInput, { target: { value: "test@hanover.edu" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(signUpButton);

        expect(await screen.findByText("You successfully registered!")).toBeInTheDocument();
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/pages/BrowsePage");
        });
    });

    it("handles successful sign-up with IndexedDB", async () => {
        process.env.NEXT_PUBLIC_USE_FIRESTORE = "false"; // IndexedDB mode
        render(<SignUp />);

        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const signUpButton = screen.getByRole("button", { name: "Sign Up" });

        const mockUser = { user: { uid: "12345", email: "test@hanover.edu" } };
        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUser);
        (addData as jest.Mock).mockResolvedValue(undefined); // ✅ Mock IndexedDB

        fireEvent.change(emailInput, { target: { value: "test@hanover.edu" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(signUpButton);

        expect(await screen.findByText("You successfully registered!")).toBeInTheDocument();
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/pages/BrowsePage");
        });
    });

    it("handles 'Email ID already registered.' error", async () => {
        render(<SignUp />);
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const signUpButton = screen.getByRole("button", { name: "Sign Up" });

        // Mock Firebase error response
        const error = new FirebaseError("auth/email-already-in-use", "Email ID already registered.");
        (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

        // Simulate user input
        fireEvent.change(emailInput, { target: { value: "test@hanover.edu" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(signUpButton);

        // Check for error message
        await waitFor(() => {
            expect(screen.getByText(/Email ID already registered\./)).toBeInTheDocument();
        });

        expect(mockPush).not.toHaveBeenCalled();
    });


    it("handles general sign-up error", async () => {
        render(<SignUp />);
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const signUpButton = screen.getByRole("button", { name: "Sign Up" });

        // Mock a general Firebase error response using FirebaseError
        const error = new FirebaseError("auth/unknown-error", "Something went wrong");
        (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

        // Simulate user input
        fireEvent.change(emailInput, { target: { value: "test@hanover.edu" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(signUpButton);

        // Check for general error message using a flexible matcher
        await waitFor(() => {
            expect(screen.getByText(/Error registering user: Something went wrong/)).toBeInTheDocument();
        });

        expect(mockPush).not.toHaveBeenCalled();
    });

});
