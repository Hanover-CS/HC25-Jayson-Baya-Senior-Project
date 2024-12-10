import React from "react"
import { FirebaseError } from "@firebase/app";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import SignUp from "@/app/pages/SignUp/page";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

jest.mock("@/lib/firebaseConfig", () => ({
    auth: {},
    db: {},
    storage: {},
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


    it("handles successful sign-up", async () => {
        render(<SignUp />);
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const signUpButton = screen.getByRole("button", { name: "Sign Up" });

        // Mock Firebase response
        const mockUser = { user: { uid: "12345", email: "test@hanover.edu" } };
        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUser);
        (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

        // Simulate user input
        fireEvent.change(emailInput, { target: { value: "test@hanover.edu" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(signUpButton);

        // Expect success message and redirection
        expect(await screen.findByText("You successfully registered!")).toBeInTheDocument();
        expect(mockPush).toHaveBeenCalledWith("/pages/BrowsePage");
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
