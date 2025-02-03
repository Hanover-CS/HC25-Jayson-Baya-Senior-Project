/**
 * SellerPage.test.tsx
 *
 * This file contains unit tests for the SellerPage component of the Panther Thrift Shop web application,
 * using React Testing Library and Jest. The tests simulate various scenarios to verify that the SellerPage
 * component behaves as expected, including user authentication, creating and updating product listings,
 * handling image uploads via Firebase Storage, and displaying/editing listings through modals.
 *
 * Key Features Tested:
 * - **Authentication:** Ensures unauthenticated users are redirected to the login page.
 * - **Creating a New Listing:** Verifies that a seller can successfully create a new product listing.
 *   This includes simulating form field inputs, image file selection, and triggering Firebase Storage's
 *   upload process, then confirming that the new product is added via the database handler.
 * - **Displaying Product Listings:** Confirms that product listings are correctly displayed (e.g., showing
 *   "Still Selling" for unsold products) after a new listing is created.
 * - **Editing a Listing:** Tests the functionality for a seller to open an edit modal for an existing
 *   listing, update product details (such as product name), and have the changes saved via the database
 *   handler.
 * - **Marking an Item as Sold:** Simulates a seller marking a product as sold by changing its status,
 *   entering a buyer's email, and ensuring that the update is reflected in the listing (displaying "Sold").
 *
 * Mocks and Dependencies:
 * - **Firebase Modules:** Firebase Authentication (`onAuthStateChanged`), Firestore, and Storage functions are mocked
 *   to isolate the component behavior. For example, the Firebase Storage functions (such as `uploadBytesResumable`
 *   and `getDownloadURL`) are mocked to simulate a successful image upload.
 * - **Next.js Router:** The `useRouter` hook is mocked to monitor redirection (e.g., redirecting unauthenticated
 *   users to the login page).
 * - **Database Handler:** Functions from the `@/lib/dbHandler` module (e.g., `getData`, `addData`, `updateData`)
 *   are mocked to simulate data interactions with either IndexedDB or Firestore.
 * - **Firestore Mocks:** Firestore's `getDocs`, `collection`, and related functions are mocked to simulate product
 *   data retrieval and updates.
 *
 * Usage:
 * - Run these tests with Jest to ensure that the SellerPage component correctly handles listing creation, editing,
 *   and status updates, as well as proper redirection for unauthenticated users.
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
import {getDownloadURL} from "firebase/storage";
import {getDocs} from "firebase/firestore";


jest.mock("firebase/app", () => ({
    initializeApp: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({ currentUser: null })),
    onAuthStateChanged: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

// Mock our database handler – this mock forces IndexedDB usage.
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
                })),
                done: Promise.resolve(),
            }),
        })
    ),
}));

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    // Return a snapshot object with an empty docs array (or with dummy docs if needed)
    getDocs: jest.fn(() =>
        Promise.resolve({
            docs: [] // or provide an array of dummy document snapshots if you need to simulate data
        })
    ),
    doc: jest.fn(),
    setDoc: jest.fn(),
    addDoc: jest.fn(),
}));


// For the image upload we want to use Firebase Storage functions.
jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(() => ({})),
    // For simplicity, our ref() returns the path string.
    ref: jest.fn((_storage, path) => path),
    // Simulate uploadBytesResumable: immediately invoke the "complete" callback.
    uploadBytesResumable: jest.fn((_ref, _file) => ({
        on: (_event: string, _progress: Function, _error: Function, complete: Function) => {
            // Directly call the complete callback to simulate a successful upload.
            complete();
        },
        snapshot: { ref: "test-ref" },
    })),
    // When getDownloadURL is called, return a dummy URL.
    getDownloadURL: jest.fn(() => Promise.resolve("http://example.com/test-image.png")),
}));

// Mock the Next.js router so that navigation can be tested.
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
        // Simulate no user logged in.
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback(null);
            return jest.fn();
        });

        render(<SellerPage />);

        await waitFor(() => expect(mockPush).toHaveBeenCalledWith(ROUTES.LOGIN));
    });

    test("creates a new listing successfully", async () => {
        // Simulate an authenticated seller.
        const fakeUser = { email: "seller@example.com" };
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            callback(fakeUser);
            return jest.fn();
        });

        // Render the SellerPage.
        const { container, getByText } = render(<SellerPage />);

        // Since our CreateListingForm does not wire up label-for associations,
        // we can query by input type.
        const productNameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
        const categorySelect = container.querySelector("select") as HTMLSelectElement;
        const priceInput = container.querySelector('input[type="number"]') as HTMLInputElement;
        const descriptionInput = container.querySelector("textarea") as HTMLTextAreaElement;
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

        // Find the "Create Listing" button.
        const createButton = getByText(/create listing/i);

        // Fill in the form fields.
        fireEvent.change(productNameInput, { target: { value: "Test Product" } });
        // Use a valid category value available in the form options (e.g., "Appliances")
        fireEvent.change(categorySelect, { target: { value: "Appliances" } });
        fireEvent.change(priceInput, { target: { value: "99.99" } });
        fireEvent.change(descriptionInput, { target: { value: "A test product" } });
        const file = new File(["dummy content"], "test-image.png", { type: "image/png" });
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Click the Create Listing button.
        fireEvent.click(createButton);

        // Wait for the image upload to finish (i.e. getDownloadURL is called).
        await waitFor(() => {
            expect(getDownloadURL).toHaveBeenCalled();
        });

        // Verify that addData was called with the new product data.
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

        // Optionally, check that the form fields have been reset.
        expect(productNameInput.value).toBe("");
        expect(categorySelect.value).toBe("");
        // Note: The number input resets to 0 (as set in your handler).
        expect(priceInput.value).toBe("0");
        expect(descriptionInput.value).toBe("");
    });

    test("displays product listing (still selling) after creating a new listing", async () => {
        // Create a dummy Firestore document snapshot that represents your product.
        const dummyProductDoc = {
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
        };

        // Override Firestore's getDocs so that it always returns our dummy product.
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [dummyProductDoc],
        });

        // Simulate an authenticated seller.
        const fakeUser = { email: "seller@example.com" };
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            callback(fakeUser);
            return jest.fn();
        });

        // Render the SellerPage.
        const { container, getByText } = render(<SellerPage />);

        // Fill in the "Create New Listing" form.
        const productNameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
        const categorySelect = container.querySelector("select") as HTMLSelectElement;
        const priceInput = container.querySelector('input[type="number"]') as HTMLInputElement;
        const descriptionInput = container.querySelector("textarea") as HTMLTextAreaElement;
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const createButton = getByText(/create listing/i);

        fireEvent.change(productNameInput, { target: { value: "Test Product" } });
        // Use a valid category value available in your form (e.g., "Appliances")
        fireEvent.change(categorySelect, { target: { value: "Appliances" } });
        fireEvent.change(priceInput, { target: { value: "99.99" } });
        fireEvent.change(descriptionInput, { target: { value: "A test product" } });
        const file = new File(["dummy content"], "test-image.png", { type: "image/png" });
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Click the "Create Listing" button.
        fireEvent.click(createButton);

        // Wait for the image upload to complete (i.e. getDownloadURL is called).
        await waitFor(() => {
            expect(getDownloadURL).toHaveBeenCalled();
        });

        // Because handleCreateListing calls fetchSellerProducts after a successful creation,
        // our dummy doc should now be used to update the listing.
        // Wait until the product title "Test Product" appears in the document.
        await waitFor(() => {
            expect(getByText("Test Product")).toBeInTheDocument();
            expect(getByText("Still Selling")).toBeInTheDocument();
            expect(getByText("$99.99")).toBeInTheDocument();
        });
    });

    test("allows seller to edit their existing product listing", async () => {
        // Create a dummy Firestore document snapshot representing an existing product.
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

        // Override Firestore's getDocs so that it initially returns our dummy product.
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [dummyProductDoc],
        });

        // Simulate an authenticated seller.
        const fakeUser = { email: "seller@example.com" };
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            callback(fakeUser);
            return jest.fn();
        });

        // Render the SellerPage.
        const { getByText, getByDisplayValue, queryByText } = render(<SellerPage />);

        // Wait until the product listing ("Old Product") is displayed.
        await waitFor(() => {
            expect(getByText("Old Product")).toBeInTheDocument();
        });

        // Simulate clicking on the product listing to open the edit modal.
        fireEvent.click(getByText("Old Product"));

        // Wait until the edit modal appears.
        await waitFor(() => {
            expect(getByText("Edit Product")).toBeInTheDocument();
        });

        // Find the product name input in the modal (with the current value "Old Product").
        const productNameInput = getByDisplayValue("Old Product") as HTMLInputElement;


        // Change the product name to "New Product".
        fireEvent.change(productNameInput, { target: { value: "New Product" } });
        expect(productNameInput.value).toBe("New Product");

        // Before clicking update, override getDocs so that the next fetch returns the updated product.
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

        // Click the "Update Product" button.
        const updateButton = getByText("Update Product");
        fireEvent.click(updateButton);

        // Verify that updateData was called with the updated product details.
        await waitFor(() => {

            expect(updateData).toHaveBeenCalledWith(
                FIRESTORE_COLLECTIONS.PRODUCTS,
                "dummy-id",
                expect.objectContaining({
                    productName: "New Product",
                })
            );
        });

        // Wait until the modal is closed.
        await waitFor(() => {
            expect(queryByText("Edit Product")).not.toBeInTheDocument();
        });

        // NEW EXPECTATION:
        // Verify that the updated product listing now displays "New Product".
        // We use a custom matcher in case the text is split across multiple nodes.
        await waitFor(() => {
            expect(
                getByText((content, node) => {
                    // Remove extra whitespace.
                    const normalizedText = content.replace(/\s+/g, " ").trim();
                    return normalizedText.includes("New Product");
                })
            ).toBeInTheDocument();
        });
    });


    test("allows seller to mark an item as sold and add buyer email", async () => {
        // Create a dummy Firestore document snapshot representing an unsold product.
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

        // Override Firestore's getDocs so that it initially returns our dummy product.
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [dummyProductDoc],
        });

        // Simulate an authenticated seller.
        const fakeUser = { email: "seller@example.com" };
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            callback(fakeUser);
            return jest.fn();
        });

        // Render the SellerPage.
        const { getByText, container, queryByText } = render(<SellerPage />);

        // Wait until the product listing ("Old Product") is displayed.
        await waitFor(() => {
            expect(getByText("Old Product")).toBeInTheDocument();
        });

        // Click on the product listing to open the edit modal.
        fireEvent.click(getByText("Old Product"));

        // Wait until the edit modal appears.
        await waitFor(() => {
            expect(getByText("Edit Product")).toBeInTheDocument();
        });

        // Locate the status select element by finding its label "Status"
        const statusLabel = getByText("Status");
        // Assume the parent element contains the select
        const statusSelect = statusLabel.parentElement?.querySelector("select") as HTMLSelectElement;
        // Initially, the status should be "Still Selling" (since sold is false).
        expect(statusSelect.value).toBe("Still Selling");

        // Change the status to "Sold".
        fireEvent.change(statusSelect, { target: { value: "Sold" } });
        expect(statusSelect.value).toBe("Sold");

        // Since the product is now marked as sold, a buyer email input should appear.
        // (Since the label isn't properly associated, we query directly.)
        const buyerEmailInput = await waitFor(() =>
            container.querySelector('input[type="email"]')
        ) as HTMLInputElement;
        // Enter a buyer email.
        fireEvent.change(buyerEmailInput, { target: { value: "buyer@example.com" } });
        expect(buyerEmailInput.value).toBe("buyer@example.com");

        // Before clicking update, override getDocs so that the next fetch returns the updated product.
        (getDocs as jest.Mock).mockResolvedValueOnce({
            docs: [
                {
                    id: "dummy-id",
                    data: () => ({
                        productName: "Old Product", // Name remains unchanged in this test.
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

        // Click the "Update Product" button.
        const updateButton = getByText("Update Product");
        fireEvent.click(updateButton);

        // Verify that updateData was called with the updated product details.
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

        // Wait until the modal is closed.
        await waitFor(() => {
            expect(queryByText("Edit Product")).not.toBeInTheDocument();
        });

        // NEW EXPECTATION:
        // Verify that the updated product listing now displays "Sold".
        // We query for the element that displays the sold status.
        await waitFor(() => {
            const soldStatusEl = container.querySelector("p.text-red-500.font-bold");
            expect(soldStatusEl).toBeTruthy();
            expect(soldStatusEl?.textContent?.trim()).toBe("Sold");
        });
    });
});
