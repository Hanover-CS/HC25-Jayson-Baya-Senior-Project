import React from "react"
import { render, screen, fireEvent } from "@testing-library/react";
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
        expect(screen.getAllByText("Sign Up")[1]).toBeInTheDocument();
    });

    it("handles successful sign-up", async () => {
        render(<SignUp />);
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const signUpButton = screen.getAllByText("Sign Up")[1];

        // Mock Firebase response
        const mockUser = { user: { uid: "12345", email: "test@hanover.edu" } };
        (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUser);
        (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

        // Simulate user input
        fireEvent.change(emailInput, { target: { value: "test@hanover.edu" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(signUpButton);

        expect(await screen.findByText("You successfully registered!")).toBeInTheDocument();
        expect(mockPush).toHaveBeenCalledWith("/pages/BrowsePage");
    });

    it("handles 'email already in use' error", async () => {
        render(<SignUp />);
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const signUpButton = screen.getAllByText("Sign Up")[1];

        // Mock Firebase error response
        const error = { code: "auth/email-already-in-use", message: "Email already in use" };
        (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

        // Simulate user input
        fireEvent.change(emailInput, { target: { value: "test@hanover.edu" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(signUpButton);

        // Check for error message
        expect(await screen.findByText("Email ID already registered.")).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
    });

    it("handles general sign-up error", async () => {
        render(<SignUp />);
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");
        const signUpButton = screen.getAllByText("Sign Up")[1];

        // Mock a general error response
        const error = { code: "auth/unknown-error", message: "Something went wrong" };
        (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

        // Simulate user input
        fireEvent.change(emailInput, { target: { value: "test@hanover.edu" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(signUpButton);

        // Check for general error message
        expect(await screen.findByText("Error registering user: Something went wrong")).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
    });
});
