import React from "react";
import { render, waitFor } from "@testing-library/react";
import SellerPage from "@/app/pages/SellersPage/page";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/Models/ConstantData";

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

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

describe("SellerPage Component", () => {
    beforeEach(() => {
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
