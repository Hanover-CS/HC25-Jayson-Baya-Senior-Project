/**
 * BuyingPage.test.tsx
 *
 * This file contains unit tests for the BuyingPage component of the Panther Thrift Shop web application,
 * using React Testing Library and Jest. These tests verify that the BuyingPage component behaves as expected
 * in various scenarios, including authentication, data fetching from IndexedDB/Firestore, tab navigation,
 * modal display for product details, and error handling.
 *
 * Key Features Tested:
 * - **User Authentication:** Ensures that unauthenticated users are redirected to the login page.
 * - **Tab Navigation:** Verifies that the component displays the "Saved Items" tab by default, and that switching
 *   between "Saved Items" and "Purchased Orders" shows the corresponding empty state messages when no items exist.
 * - **Product Display:** Confirms that saved and purchased products are rendered correctly and that product details
 *   are displayed when a product is clicked.
 * - **Modal Functionality:** Ensures that clicking on a product opens a modal displaying detailed product information,
 *   and that the modal can be closed correctly.
 *
 * Mocks and Dependencies:
 * - **Firebase Auth:** The `onAuthStateChanged` function is mocked to simulate both authenticated and unauthenticated states.
 * - **Next.js Navigation:** The `useRouter` hook is mocked to monitor redirection (using `router.push`).
 * - **Data Fetching:** The `getData` function (and others such as `addData` and `deleteData`) from the database handler
 *   module is mocked to simulate data retrieval from either Firestore or IndexedDB.
 * - **Component Imports:** The BuyingPage component and related models (e.g., Product) are imported to perform the tests.
 *
 * Author: Jayson Baya
 * Last Updated: January 25, 2025
 */


import React from "react";
import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import { onAuthStateChanged } from "firebase/auth";
import { ROUTES } from "@/Models/ConstantData";
import { useRouter } from "next/navigation";
import BuyingPage from "@/app/pages/BuyingPage/page";
import {getData} from "@/lib/dbHandler";
import {Product} from "@/Models/Product";

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


    test("switching between tabs shows the correct empty message", async () => {
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: "user@example.com" });
            return jest.fn();
        });

        render(<BuyingPage />);

        // Ensure 'No saved items' is displayed initially
      (await waitFor(() => expect(screen.getByText("No saved items yet.")))).toBeInTheDocument();

        // Switch to Purchased Orders tab
        const purchasedOrdersTab = screen.getByRole("button", { name: "Purchased Orders" });
        fireEvent.click(purchasedOrdersTab);

        // Ensure 'No purchased items' message appears
       (await waitFor(() => expect(screen.getByText("No purchased items yet.")))).toBeInTheDocument();

        // Switch back to Saved Items tab
        const savedItemsTab = screen.getByRole("button", { name: "Saved Items" });
        fireEvent.click(savedItemsTab);

        // Ensure 'No saved items' message appears again
        (await waitFor(() => expect(screen.getByText("No saved items yet.")))).toBeInTheDocument();
    });



    test("displays a clickable saved item under Saved Items tab using IndexedDB and opens ProductModal", async () => {
        const mockSavedItems: Product[] = [
            {
                id: "1",
                productName: "Case",
                price: 122,
                category: "Appliances",
                imageURL: "imgCase.jpg",
                description: "cc",
                seller: "caio@hanover.edu",
                sold: false,
                markAsSold: jest.fn(), //  Add mock function
                updateDetails: jest.fn(), //  Add mock function
                getSummary: jest.fn(() => "Product B - $20 (Category B)"), //  Add mock function
            },
        ];

        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: "user@example.com" });
            return jest.fn();
        });

        (getData as jest.Mock).mockResolvedValueOnce(mockSavedItems);

        render(<BuyingPage />);

        await waitFor(() => expect(screen.getAllByText("Case")[0]).toBeInTheDocument());

        fireEvent.click(screen.getByAltText("Case"));

        await waitFor(() => {
            const modal = screen.getByRole("dialog");
            expect(modal).toBeInTheDocument();
            expect(within(modal).getByText("Case")).toBeInTheDocument();
            expect(within(modal).getByText("Price: $122")).toBeInTheDocument();
            expect(within(modal).getByText("Category: Appliances")).toBeInTheDocument();
            expect(within(modal).getByText("Description: cc")).toBeInTheDocument();
            expect(within(modal).getByText("Seller: caio@hanover.edu")).toBeInTheDocument();
        });

        const closeButton = screen.getByRole("button", { name: /×/i });
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            expect(screen.getByAltText("Case")).toBeInTheDocument();
            expect(screen.getByText("$122.00")).toBeInTheDocument();
            expect(screen.getByText("cc")).toBeInTheDocument();
        });
    });

    test("displays a clickable purchased item under Purchased Orders tab using IndexedDB and opens ProductModal", async () => {
        const mockPurchasedItems: Product[] = [
            {
                id: "2",
                productName: "Laptop",
                price: 899,
                category: "Electronics",
                imageURL: "imgLaptop.jpg",
                description: "High-performance laptop",
                seller: "jayson@hanover.edu",
                sold: true,
                markAsSold: jest.fn(), //  Add mock function
                updateDetails: jest.fn(), //  Add mock function
                getSummary: jest.fn(() => "Product B - $20 (Category B)"), //  Add mock function
            },
        ];

        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: "user@example.com" });
            return jest.fn();
        });

        (getData as jest.Mock).mockResolvedValueOnce([]).mockResolvedValueOnce(mockPurchasedItems);

        render(<BuyingPage />);

        const purchasedOrdersTab = screen.getByRole("button", { name: "Purchased Orders" });
        fireEvent.click(purchasedOrdersTab);

        await waitFor(() => expect(screen.getByText("Laptop")).toBeInTheDocument());

        fireEvent.click(screen.getByAltText("Laptop"));

        await waitFor(() => {
            const modal = screen.getByRole("dialog");
            expect(modal).toBeInTheDocument();
            expect(within(modal).getByText("Laptop")).toBeInTheDocument();
            expect(within(modal).getByText("Price: $899")).toBeInTheDocument();
            expect(within(modal).getByText("Category: Electronics")).toBeInTheDocument();
            expect(within(modal).getByText("Description: High-performance laptop")).toBeInTheDocument();
            expect(within(modal).getByText("Seller: jayson@hanover.edu")).toBeInTheDocument();
        });

        const closeButton = screen.getByRole("button", { name: /×/i });
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            expect(screen.getByAltText("Laptop")).toBeInTheDocument();
            expect(screen.getByText("$899.00")).toBeInTheDocument();
            expect(screen.getByText("High-performance laptop")).toBeInTheDocument();
        });
    });
});