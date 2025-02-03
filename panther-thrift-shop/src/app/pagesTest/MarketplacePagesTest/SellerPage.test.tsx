/**
 * SellerPage.test.tsx
 *
 * This file contains unit tests for the SellerPage component of the Panther Thrift Shop web application,
 * using React Testing Library and Jest. The tests simulate various scenarios to verify that the SellerPage
 * component behaves as expected, including user authentication, creating and updating product listings,
 * handling image uploads via Firebase Storage, and displaying/editing listings through modals.
 *
 * Key Features Tested:
 * - Authentication: Ensures unauthenticated users are redirected to the login page.
 * - Creating a New Listing: Verifies that a seller can successfully create a new product listing.
 * - Displaying Product Listings: Confirms that product listings are correctly displayed after creation.
 * - Editing a Listing: Tests the functionality for a seller to open an edit modal and update product details.
 * - Marking an Item as Sold: Simulates a seller marking a product as sold and adding a buyer's email.
 *
 * Mocks and Dependencies:
 * - Firebase Modules: Firebase Authentication (onAuthStateChanged), Firestore, and Storage functions are mocked.
 * - Next.js Router: The useRouter hook is mocked to monitor redirection.
 * - Database Handler: Functions from @/lib/dbHandler are mocked to simulate data interactions with IndexedDB.
 * - Firestore and Storage mocks ensure that external API calls are simulated.
 *
 * Author: Jayson Baya
 * Last Updated: January 25, 2025
 */

import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";
import SellerPage from "@/app/pages/SellersPage/page";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ROUTES, FIRESTORE_COLLECTIONS } from "@/Models/ConstantData";
import {addData, updateData} from "@/lib/dbHandler";
import { getDownloadURL } from "firebase/storage";
import { getDocs } from "firebase/firestore";

// ----------------------
// Firebase and DB Mocks
// ----------------------

// Mock Firebase Authentication.
jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({ currentUser: null })),
    onAuthStateChanged: jest.fn(),
}));

// Mock Next.js navigation.
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

// Mock our database handler – this forces IndexedDB usage.
jest.mock("@/lib/dbHandler", () => ({
    getData: jest.fn(() => Promise.resolve([])),
    addData: jest.fn(() => Promise.resolve()),
    updateData: jest.fn(() => Promise.resolve()),
    initializeDB: jest.fn(() =>
        Promise.resolve({
            transaction: jest.fn().mockReturnValue({
                objectStore: jest.fn(() => ({
                    getAll: jest.fn(() => Promise.resolve([])),
                    put: jest.fn(() => Promise.resolve()),
                    add: jest.fn(() => Promise.resolve()),
                    delete: jest.fn(() => Promise.resolve()),
                })),
                done: Promise.resolve(),
            }),
        })
    ),
}));

// Mock Firebase Firestore.
jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(() =>
        Promise.resolve({
            docs: [] // Default to empty; overridden in tests as needed.
        })
    ),
    doc: jest.fn(),
    setDoc: jest.fn(),
    addDoc: jest.fn(),
}));

// Mock Firebase Storage.
jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(() => ({})),
    // ref returns the path string.
    ref: jest.fn((_storage: unknown, path: string): string => path),
    // uploadBytesResumable now types its callbacks explicitly.
    uploadBytesResumable: jest.fn((): {
            on: (
                event: string,
                progress: (snapshot: { bytesTransferred: number; totalBytes: number }) => void,
                error: (error: Error) => void,
                complete: () => void
            ) => void;
            snapshot: { ref: string };
        } => ({
            on: (
                event: string,
                progress: (snapshot: { bytesTransferred: number; totalBytes: number }) => void,
                error: (error: Error) => void,
                complete: () => void
            ): void => {
                // For simplicity, we call the complete callback immediately.
                complete();
            },
            snapshot: { ref: "test-ref" },
        })
    ),
    getDownloadURL: jest.fn(() => Promise.resolve("http://example.com/test-image.png")),
}));

// Mock the Next.js router.
const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

// ----------------------
// Test Suite Starts Here
// ----------------------
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

    test("creates a new listing successfully", async () => {
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: "seller@example.com" });
            return jest.fn();
        });

        const { container, getByText } = render(<SellerPage />);

        // Since CreateListingForm doesn't use label associations, query inputs by type.
        const productNameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
        const categorySelect = container.querySelector("select") as HTMLSelectElement;
        const priceInput = container.querySelector('input[type="number"]') as HTMLInputElement;
        const descriptionInput = container.querySelector("textarea") as HTMLTextAreaElement;
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

        const createButton = getByText(/create listing/i);

        // Fill in the form fields.
        fireEvent.change(productNameInput, { target: { value: "Test Product" } });
        fireEvent.change(categorySelect, { target: { value: "Appliances" } });
        fireEvent.change(priceInput, { target: { value: "99.99" } });
        fireEvent.change(descriptionInput, { target: { value: "A test product" } });
        const dummyFile = new File(["dummy content"], "test-image.png", { type: "image/png" });
        fireEvent.change(fileInput, { target: { files: [dummyFile] } });

        fireEvent.click(createButton);

        // Verify that getDownloadURL (from Firebase Storage) was called.
        await waitFor(() => {
            expect(getDownloadURL).toHaveBeenCalled();
        });

        // Verify that addData was called with the expected product data.
        await waitFor(() => {
            expect(addData).toHaveBeenCalledWith(
                FIRESTORE_COLLECTIONS.PRODUCTS,
                expect.objectContaining({
                    productName: "Test Product",
                    category: "Appliances",
                    price: 99.99,
                    description: "A test product",
                    imageURL: "http://example.com/test-image.png",
                    seller: "seller@example.com",
                    sold: false,
                })
            );
        });

        // Optionally, verify that form fields are reset.
        expect(productNameInput.value).toBe("");
        expect(categorySelect.value).toBe("");
        expect(priceInput.value).toBe("0");
        expect(descriptionInput.value).toBe("");
    });

    test("displays product listing after creating a new listing", async () => {
        // Override Firestore's getDocs to return a dummy product.
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: "dummy-id",
                    data: () => ({
                        productName: "Test Product",
                        category: "Appliances",
                        price: 99.99,
                        description: "A test product",
                        imageURL: "http://example.com/test-image.png",
                        seller: "seller@example.com",
                        sold: false,
                        createdAt: "2025-01-01T00:00:00Z",
                        buyerEmail: "",
                        purchaseDate: "2025-01-01T00:00:00Z",
                    }),
                },
            ],
        });

        const fakeUser = { email: "seller@example.com" };
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback(fakeUser);
            return jest.fn();
        });

        const { container, getByText } = render(<SellerPage />);

        const productNameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
        const categorySelect = container.querySelector("select") as HTMLSelectElement;
        const priceInput = container.querySelector('input[type="number"]') as HTMLInputElement;
        const descriptionInput = container.querySelector("textarea") as HTMLTextAreaElement;
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const createButton = getByText(/create listing/i);

        fireEvent.change(productNameInput, { target: { value: "Test Product" } });
        fireEvent.change(categorySelect, { target: { value: "Appliances" } });
        fireEvent.change(priceInput, { target: { value: "99.99" } });
        fireEvent.change(descriptionInput, { target: { value: "A test product" } });
        const dummyFile = new File(["dummy content"], "test-image.png", { type: "image/png" });
        fireEvent.change(fileInput, { target: { files: [dummyFile] } });

        fireEvent.click(createButton);

        await waitFor(() => {
            expect(getDownloadURL).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(getByText("Test Product")).toBeInTheDocument();
            expect(getByText("$99.99")).toBeInTheDocument();
        });
    });

    test("allows seller to edit their existing product listing", async () => {
        // Dummy Firestore document representing an existing product.
        const dummyProductDoc = {
            id: "dummy-id",
            data: () => ({
                productName: "Old Product",
                category: "Appliances",
                price: 99.99,
                description: "Old description",
                imageURL: "http://example.com/old-image.png",
                seller: "seller@example.com",
                sold: false,
                createdAt: "2025-01-01T00:00:00Z",
                buyerEmail: "",
                purchaseDate: "2025-01-01T00:00:00Z",
            }),
        };

        (getDocs as jest.Mock).mockResolvedValue({
            docs: [dummyProductDoc],
        });

        const fakeUser = { email: "seller@example.com" };
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback(fakeUser);
            return jest.fn();
        });

        const { getByText, getByDisplayValue, queryByText } = render(<SellerPage />);

        await waitFor(() => {
            expect(getByText("Old Product")).toBeInTheDocument();
        });

        fireEvent.click(getByText("Old Product"));

        await waitFor(() => {
            expect(getByText("Edit Product")).toBeInTheDocument();
        });

        const productNameInput = getByDisplayValue("Old Product") as HTMLInputElement;
        fireEvent.change(productNameInput, { target: { value: "New Product" } });
        expect(productNameInput.value).toBe("New Product");

        // Override getDocs for updated product.
        (getDocs as jest.Mock).mockResolvedValueOnce({
            docs: [
                {
                    id: "dummy-id",
                    data: () => ({
                        productName: "New Product",
                        category: "Appliances",
                        price: 99.99,
                        description: "Old description",
                        imageURL: "http://example.com/old-image.png",
                        seller: "seller@example.com",
                        sold: false,
                        createdAt: "2025-01-01T00:00:00Z",
                        buyerEmail: "",
                        purchaseDate: "2025-01-01T00:00:00Z",
                    }),
                },
            ],
        });

        const updateButton = getByText("Update Product");
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(updateData).toHaveBeenCalledWith(
                FIRESTORE_COLLECTIONS.PRODUCTS,
                "dummy-id",
                expect.objectContaining({
                    productName: "New Product",
                })
            );
        });

        await waitFor(() => {
            expect(queryByText("Edit Product")).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(getByText((content) => {
                const normalizedText = content.replace(/\s+/g, " ").trim();
                return normalizedText.includes("New Product");
            })).toBeInTheDocument();
        });
    });

    test("allows seller to mark an item as sold and add buyer email", async () => {
        // Dummy Firestore document representing an unsold product.
        const dummyProductDoc = {
            id: "dummy-id",
            data: () => ({
                productName: "Old Product",
                category: "Appliances",
                price: 99.99,
                description: "Old description",
                imageURL: "http://example.com/old-image.png",
                seller: "seller@example.com",
                sold: false,
                createdAt: "2025-01-01T00:00:00Z",
                buyerEmail: "",
                purchaseDate: "2025-01-01T00:00:00Z",
            }),
        };

        (getDocs as jest.Mock).mockResolvedValue({
            docs: [dummyProductDoc],
        });

        const fakeUser = { email: "seller@example.com" };
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback(fakeUser);
            return jest.fn();
        });

        const { getByText, container, queryByText } = render(<SellerPage />);

        await waitFor(() => {
            expect(getByText("Old Product")).toBeInTheDocument();
        });

        fireEvent.click(getByText("Old Product"));

        await waitFor(() => {
            expect(getByText("Edit Product")).toBeInTheDocument();
        });

        // Locate the status select element via its label.
        const statusLabel = getByText("Status");
        const statusSelect = statusLabel.parentElement?.querySelector("select") as HTMLSelectElement;
        expect(statusSelect.value).toBe("Still Selling");

        fireEvent.change(statusSelect, { target: { value: "Sold" } });
        expect(statusSelect.value).toBe("Sold");

        // Wait for the buyer email input to appear.
        const buyerEmailInput = await waitFor(() =>
            container.querySelector('input[type="email"]')
        ) as HTMLInputElement;
        fireEvent.change(buyerEmailInput, { target: { value: "buyer@example.com" } });
        expect(buyerEmailInput.value).toBe("buyer@example.com");

        (getDocs as jest.Mock).mockResolvedValueOnce({
            docs: [
                {
                    id: "dummy-id",
                    data: () => ({
                        productName: "Old Product",
                        category: "Appliances",
                        price: 99.99,
                        description: "Old description",
                        imageURL: "http://example.com/old-image.png",
                        seller: "seller@example.com",
                        sold: true,
                        createdAt: "2025-01-01T00:00:00Z",
                        buyerEmail: "buyer@example.com",
                        purchaseDate: "2025-01-01T00:00:00Z",
                    }),
                },
            ],
        });

        const updateButton = getByText("Update Product");
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(updateData).toHaveBeenCalledWith(
                FIRESTORE_COLLECTIONS.PRODUCTS,
                "dummy-id",
                expect.objectContaining({
                    sold: true,
                    buyerEmail: "buyer@example.com",
                })
            );
        });

        await waitFor(() => {
            expect(queryByText("Edit Product")).not.toBeInTheDocument();
        });

        await waitFor(() => {
            const soldStatusEl = container.querySelector("p.text-red-500.font-bold");
            expect(soldStatusEl).toBeTruthy();
            expect(soldStatusEl?.textContent?.trim()).toBe("Sold");
        });
    });
});
