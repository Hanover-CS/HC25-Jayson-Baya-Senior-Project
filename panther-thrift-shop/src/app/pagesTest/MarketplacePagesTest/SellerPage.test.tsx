import React from "react";
import { render, waitFor } from "@testing-library/react";
import SellerPage from "@/app/pages/SellersPage/page";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/Models/ConstantData";

jest.mock("firebase/app", () => ({
    initializeApp: jest.fn(),
}));

// Mock Firebase authentication
jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({ currentUser: null })),
    onAuthStateChanged: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

jest.mock("@/lib/dbHandler", () => ({
    getData: jest.fn(() => Promise.resolve([])),
    addData: jest.fn(() => Promise.resolve()),
    updateData: jest.fn(() => Promise.resolve()),
}));

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    addDoc: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(() => ({})),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

describe("SellerPage Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("redirects unauthenticated users to login", async () => {
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback(null);
            return jest.fn();
        });

        render(<SellerPage />);

        await waitFor(() => expect(mockPush).toHaveBeenCalledWith(ROUTES.LOGIN));
    });

});
