//  BuyingPage.test.tsx
import React from "react";
import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import { onAuthStateChanged } from "firebase/auth";
import { ROUTES } from "@/Models/ConstantData";
import { useRouter } from "next/navigation";
import { Product } from "@/Models/Product";
import { fetchFirestoreData } from "@/utils/fetchFirestoreData";
import BuyingPage from "@/app/pages/BuyingPage/page";
import {getData} from "@/lib/dbHandler";

// Mock firebase/auth
jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({ currentUser: null })),
    onAuthStateChanged: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

jest.mock("@/utils/fetchFirestoreData", () => ({
    fetchFirestoreData: jest.fn(),
}));

jest.mock("@/lib/dbHandler", () => ({
    getData: jest.fn(),
    addData: jest.fn(),
    deleteData: jest.fn(),
}));

const mockPush = jest.fn();

(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
});

describe("BuyingPage Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("redirects unauthenticated users to login", async () => {
        // Mock unauthenticated state
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback(null); // Simulate unauthenticated user
            return jest.fn(); // Mock unsubscribe function
        });

        render(<BuyingPage />);

        // Assert redirection to login
        await waitFor(() => expect(mockPush).toHaveBeenCalledWith(ROUTES.LOGIN));
    });

    test("displays 'Saved Items' tab by default", async () => {
        const mockSavedItems = [
            { id: "1",
                productName: "Product A",
                price: 20,
                category: "Category A",
                imageURL: "imgA.jpg",
                description: "Description A",
                seller: "sellerA@example.com",
                sold: false,
            },
        ];

        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: "user@example.com" });
            return jest.fn();
        });

        (getData as jest.Mock)
            .mockResolvedValueOnce(mockSavedItems) // For saved items
            .mockResolvedValueOnce([]); // For purchased items

        render(<BuyingPage />);

        await waitFor(() => expect(screen.getByText("Product A")).toBeInTheDocument());
    });

});
