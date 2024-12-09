// BrowsePage.test.tsx
import React from "react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import BrowsePage from "@/app/pages/BrowsePage/page";
import { onAuthStateChanged } from "firebase/auth";
import { ROUTES } from "@/Models/ConstantData";
import {useRouter} from "next/navigation";
import {Product} from "@/Models/Product";
import * as firestoreUtils from "@/utils/firestoreUtils";
import ProductGrid from "@/components/ProductGrid";
import {saveProduct} from "@/utils/firestoreUtils";


// Mock firebase/auth
jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({ currentUser: null })),
    onAuthStateChanged: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();

(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
});

describe("BrowsePage Component", () => {
    let alertMock: jest.SpyInstance;

    beforeEach(() => {
        // Mock window.alert
        alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("redirects unauthenticated users to login", async () => {
        // Mock unauthenticated state
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback(null); // Simulate unauthenticated user
            return jest.fn(); // Mock unsubscribe function
        });

        render(<BrowsePage />);

        // Assert redirection to login
        await waitFor(() => expect(mockPush).toHaveBeenCalledWith(ROUTES.LOGIN));
    });

    test("fetches and displays products", async () => {
        const mockProducts: Product[] = [
            {
                id: "1",
                productName: "Product A",
                price: 10,
                category: "Category A",
                imageURL: "imgA.jpg",
                description: "Description A",
                seller: "sellerA@example.com",
                sold: false,
                markAsSold: jest.fn(),
                updateDetails: jest.fn(),
                getSummary: jest.fn(() => "Product A - $10 (Category A)"),
            },
            {
                id: "2",
                productName: "Product B",
                price: 20,
                category: "Category B",
                imageURL: "imgB.jpg",
                description: "Description B",
                seller: "sellerB@example.com",
                sold: false,
                markAsSold: jest.fn(),
                updateDetails: jest.fn(),
                getSummary: jest.fn(() => "Product B - $20 (Category B)"),
            },
        ];

        // Mock `onAuthStateChanged` to simulate authenticated user
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            callback({ email: "user@example.com" }); // Simulate authenticated user
            return jest.fn(); // Mock unsubscribe function
        });

        // Mock `fetchRealTimeData`
        jest.spyOn(firestoreUtils, "fetchRealTimeData").mockImplementationOnce(
            (_collectionName, _conditions, onSuccess) => {
                onSuccess(mockProducts); // Simulate fetching products
                return jest.fn(); // Mock unsubscribe function
            }
        );

        render(<BrowsePage />);

        // Wait for products to render
        await waitFor(() => expect(screen.getByText("Product A")).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText("Product B")).toBeInTheDocument());
    });

    test("renders product grid", async () => {
        const mockProducts: Product[] = [
            {
                id: "1",
                productName: "Product A",
                price: 10,
                category: "Category A",
                imageURL: "imgA.jpg",
                description: "Description A",
                seller: "sellerA@example.com",
                sold: false,
                markAsSold: jest.fn(),
                updateDetails: jest.fn(),
                getSummary: jest.fn(() => "Product A - $10 (Category A)"),
            },
        ];

        render(
            <ProductGrid
                products={mockProducts}
                onProductClick={() => {}}
                onSaveProduct={() => {}}
                onSellerRedirect={() => {}}
                userEmail="user@example.com"
            />
        );

        // Assertions
        expect(screen.getByText("Product A")).toBeInTheDocument();
        expect(screen.getByText("$10")).toBeInTheDocument();
        expect(screen.getByAltText("Product A")).toBeInTheDocument();
    });

    test("saves product successfully", async () => {
        // Mock implementation of `saveProduct`
        jest.spyOn(require("@/utils/firestoreUtils"), "saveProduct").mockResolvedValueOnce(undefined);
        const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

        const mockProducts: Product[] = [
            {
                id: "1",
                productName: "Product A",
                price: 10,
                category: "Category A",
                imageURL: "imgA.jpg",
                description: "Description A",
                seller: "sellerA@example.com",
                sold: false,
                markAsSold: jest.fn(),
                updateDetails: jest.fn(),
                getSummary: jest.fn(() => "Product A - $10 (Category A)"),
            },
        ];

        // Mock authenticated user
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: "user@example.com" }); // Simulate authenticated user
            return jest.fn(); // Mock unsubscribe function
        });

        // Mock fetching products
        jest.spyOn(firestoreUtils, "fetchRealTimeData").mockImplementationOnce(
            (_collectionName, _conditions, onSuccess) => {
                onSuccess(mockProducts); // Simulate fetching products
                return jest.fn(); // Mock unsubscribe function
            }
        );


        // Mock saveProduct to resolve successfully
        (saveProduct as jest.Mock).mockResolvedValueOnce(undefined);

        render(<BrowsePage />);

        // Wait for the Save button to render
        await waitFor(() => expect(screen.getByText("Save")).toBeInTheDocument());

        // Simulate clicking the Save button
        fireEvent.click(screen.getByText("Save"));

        // Verify alert is called with the correct message
        await waitFor(() => expect(alertMock).toHaveBeenCalledWith("Item saved successfully!"));
    });


});

