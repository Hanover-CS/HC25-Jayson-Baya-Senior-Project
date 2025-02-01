// SellerPage.test.tsx
import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";
import SellerPage from "@/app/pages/SellersPage/page";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ROUTES, FIRESTORE_COLLECTIONS } from "@/Models/ConstantData";
import { addData } from "@/lib/dbHandler";


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
    ref: jest.fn((storage, path) => path),
    // Simulate uploadBytesResumable: immediately invoke the "complete" callback.
    uploadBytesResumable: jest.fn((ref, file) => ({
        on: (event: string, progress: Function, error: Function, complete: Function) => {
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
            const { getDownloadURL } = require("firebase/storage");
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
        const { getDocs } = require("firebase/firestore");
        getDocs.mockResolvedValue({
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
            const { getDownloadURL } = require("firebase/storage");
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
});
