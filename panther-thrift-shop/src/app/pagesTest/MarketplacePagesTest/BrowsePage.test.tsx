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
import {FirestoreError} from "firebase/firestore";


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
        jest.spyOn(firestoreUtils, "saveProduct").mockResolvedValueOnce(undefined);

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

    test("opens product modal with details", async () => {
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

        render(<BrowsePage />);

        // Wait for product to render
        await waitFor(() => expect(screen.getByAltText("Product A")).toBeInTheDocument());

        // Simulate clicking the product image
        fireEvent.click(screen.getByAltText("Product A"));

        // Assertions: Verify modal opens with product details
        await waitFor(() => expect(screen.getByText("Description A")).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText("$10")).toBeInTheDocument());
    });

    test("shows error message on fetch failure", async () => {
        // Mock console.error to suppress the error log during the test
        const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});

        // Mock authenticated user
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: "user@example.com" }); // Simulate authenticated user
            return jest.fn(); // Mock unsubscribe function
        });

        // Mock implementation of fetchRealTimeData to simulate an error
        jest.spyOn(firestoreUtils, "fetchRealTimeData").mockImplementationOnce(
            (_collectionName, _conditions, _onSuccess, onError) => {
                const mockError: FirestoreError = {
                    code: "unavailable",
                    name: "FirestoreError",
                    message: "Fetch error",
                }; // Simulate a FirestoreError with required properties
                onError(mockError);
                return jest.fn(); // Mock unsubscribe function
            }
        );

        render(<BrowsePage />);

        // Wait for the error message to be displayed
        await waitFor(() =>
            expect(
                screen.getByText("Error fetching products. Please try again later.")
            ).toBeInTheDocument()
        );

        // Restore console.error after the test
        consoleErrorMock.mockRestore();
    });

    test("displays loading indicator", async () => {
        // Mock authenticated user
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: "user@example.com" }); // Simulate authenticated user
            return jest.fn(); // Mock unsubscribe function
        });

        // Mock fetchRealTimeData to simulate a pending fetch
        jest.spyOn(firestoreUtils, "fetchRealTimeData").mockImplementationOnce(() => {
            return jest.fn(); // Mock unsubscribe function
        });

        render(<BrowsePage />);

        // Assert that the loading indicator is displayed
        expect(screen.getByText("Loading products...")).toBeInTheDocument();
    });

    test("shows 'Listings' button for product seller", async () => {
        const mockProduct: Product = {
            id: "1",
            productName: "Product A",
            price: 10,
            category: "Category A",
            imageURL: "imgA.jpg",
            description: "Description A",
            seller: "test@example.com",
            sold: false,
            markAsSold: jest.fn(),
            updateDetails: jest.fn(),
            getSummary: jest.fn(() => "Product A - $10 (Category A)"),
        };

        render(<ProductGrid products={[mockProduct]} userEmail="test@example.com" />);

        // Verify that the 'Listings' button is displayed for the seller
        expect(screen.getByText("Listings")).toBeInTheDocument();
    });

    test("displays empty message when no products available", () => {
        render(<ProductGrid products={[]} emptyMessage="No products to show." />);
        // Assert that the empty message is displayed
        expect(screen.getByText("No products to show.")).toBeInTheDocument();
    });
});








