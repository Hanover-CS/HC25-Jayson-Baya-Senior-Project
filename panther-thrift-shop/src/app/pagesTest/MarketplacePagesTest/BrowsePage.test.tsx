import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BrowsePage from "@/app/pages/BrowsePage/page";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import {getData, addData, deleteData} from "@/lib/dbHandler";
import { Product } from "@/Models/Product";
import { ROUTES } from "@/Models/ConstantData";

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

jest.mock("@/lib/dbHandler", () => ({
    getData: jest.fn(() => Promise.resolve([])),
    addData: jest.fn(() => Promise.resolve()),
    deleteData: jest.fn(() => Promise.resolve()),
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

describe("BrowsePage Component (Firestore & IndexedDB Tests)", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("redirects unauthenticated users to login", async () => {
        // Simulate unauthenticated user
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback(null);
            return jest.fn();
        });

        render(<BrowsePage />);

        await waitFor(() => expect(mockPush).toHaveBeenCalledWith(ROUTES.LOGIN));
    });

    test.each([true, false])(
        "fetches and displays products (Firestore=%s, IndexedDB=%s)",
        async (useFirestore) => {
            process.env.NEXT_PUBLIC_USE_FIRESTORE = useFirestore ? "true" : "false";

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
                    markAsSold: jest.fn(), // dd mock function
                    updateDetails: jest.fn(), // Add mock function
                    getSummary: jest.fn(() => "Product A - $10 (Category A)"), // Add mock function
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
                    markAsSold: jest.fn(), //  Add mock function
                    updateDetails: jest.fn(), //  Add mock function
                    getSummary: jest.fn(() => "Product B - $20 (Category B)"), //  Add mock function
                },
            ];


            // Simulate authenticated user
            (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
                callback({ email: "user@example.com" });
                return jest.fn();
            });

            // Mock getData to fetch from Firestore or IndexedDB
            (getData as jest.Mock).mockResolvedValue(mockProducts);

            render(<BrowsePage />);

            await waitFor(() => expect(screen.getByText("Product A")).toBeInTheDocument());
            await waitFor(() => expect(screen.getByText("Product B")).toBeInTheDocument());
        }
    );

    test("shows 'Manage Listings' button for product seller", async () => {
        process.env.NEXT_PUBLIC_USE_FIRESTORE = "false";

        const userEmail = "test@example.com"; // The logged-in user's email
        const mockProduct: Product = {
            id: "1",
            productName: "Product A",
            price: 10,
            category: "Category A",
            imageURL: "imgA.jpg",
            description: "Description A",
            seller: userEmail, // Ensure seller matches authenticated user
            sold: false,
            markAsSold: jest.fn(), //  Add mock function
            updateDetails: jest.fn(), //  Add mock function
            getSummary: jest.fn(() => "Product B - $20 (Category B)"), //  Add mock function
        };

        // Mock authenticated user
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: userEmail }); // Set the logged-in user's email
            return jest.fn();
        });

        // Ensure getData returns a product where the seller matches userEmail
        (getData as jest.Mock).mockResolvedValue([mockProduct]);

        render(<BrowsePage />);

        // Ensure products load before checking for the button
        await waitFor(() => {
            expect(screen.queryByText("Loading products...")).not.toBeInTheDocument();
        });

        // "Manage Listings" should appear because userEmail === product.seller
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /My Listings/i })).toBeInTheDocument()
        );
    });


    test("saves product successfully in IndexedDB", async () => {
        process.env.NEXT_PUBLIC_USE_FIRESTORE = "false"; // Ensure IndexedDB mode

        const userEmail = "buyer@example.com"; // Logged-in user's email (not the seller)
        const mockProduct: Product = {
            id: "1",
            productName: "Product A",
            price: 10,
            category: "Category A",
            imageURL: "imgA.jpg",
            description: "Description A",
            seller: "sellerA@example.com", // Ensure seller is different from logged-in user
            sold: false,
            markAsSold: jest.fn(), //  Add mock function
            updateDetails: jest.fn(), //  Add mock function
            getSummary: jest.fn(() => "Product B - $20 (Category B)"), //  Add mock function
        };

        const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

        // Mock authenticated user (buyer, not the seller)
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: userEmail });
            return jest.fn();
        });

        // Ensure IndexedDB functions are properly mocked

        (getData as jest.Mock).mockImplementation((collection) => {
            if (collection === "savedItems") {
                return Promise.resolve([]); // No saved items initially
            }
            return Promise.resolve([mockProduct]); // Return product listings
        });

        (addData as jest.Mock).mockResolvedValue(undefined); // Mock adding product

        render(<BrowsePage />);

        // Ensure products load before searching for the "Save" button
        await waitFor(() => {
            expect(screen.queryByText("Loading products...")).not.toBeInTheDocument();
        });

        // Wait for "Save" button to appear (since logged-in user is not the seller)
        const saveButton = await screen.findByRole("button", { name: /Save/i });
        expect(saveButton).toBeInTheDocument();

        // Click the "Save" button
        fireEvent.click(saveButton);

        /// Ensure `addData` was called correctly
        await waitFor(() => {
            expect(addData).toHaveBeenCalledWith("savedItems", expect.objectContaining({
                id: mockProduct.id,
                buyerEmail: userEmail
            }));
        });

        // Ensure alert is triggered
        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith("Item saved successfully!");
        });

        // Ensure button text updates to "Saved"
        await waitFor(() => {
            expect(screen.getByRole("button", { name: /Saved/i })).toBeInTheDocument();
        });

        alertMock.mockRestore()
    });


    test("unsaves product successfully in IndexedDB", async () => {
        process.env.NEXT_PUBLIC_USE_FIRESTORE = "false"; // Ensure IndexedDB mode

        const userEmail = "buyer@example.com"; // Logged-in user's email (not the seller)
        const mockProduct: Product = {
            id: "1",
            productName: "Product A",
            price: 10,
            category: "Category A",
            imageURL: "imgA.jpg",
            description: "Description A",
            seller: "sellerA@example.com", // Ensure seller is different from logged-in user
            sold: false,
            markAsSold: jest.fn(), //  Add mock function
            updateDetails: jest.fn(), //  Add mock function
            getSummary: jest.fn(() => "Product B - $20 (Category B)"), //  Add mock function
        };

        const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

        // Mock authenticated user
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: userEmail });
            return jest.fn();
        });

        // Mock IndexedDB functions
        (getData as jest.Mock).mockResolvedValue([mockProduct]); // Product already saved
        (deleteData as jest.Mock).mockResolvedValue(undefined); // Mock removing product

        render(<BrowsePage />);

        // Ensure products load before searching for the "Saved" button
        await waitFor(() => {
            expect(screen.queryByText("Loading products...")).not.toBeInTheDocument();
        });

        // Wait for "Saved" button to appear (assuming the product was already saved)
        const savedButton = await screen.findByRole("button", { name: /Saved/i });
        expect(savedButton).toBeInTheDocument();

        // Click the "Saved" button to unsave
        fireEvent.click(savedButton);

        // Ensure `deleteData` is called once to remove from IndexedDB
        await waitFor(() => {
            expect(deleteData).toHaveBeenCalledTimes(1);
            expect(deleteData).toHaveBeenCalledWith("savedItems", mockProduct.id); // Ensure correct collection & ID
        });

        // Ensure alert was triggered when unsaving
        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith("Item unsaved successfully!"); // Match the alert message
        });

        // Ensure button text updates back to "Save"
        await waitFor(() => {
            expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
        });

        // Restore alert mock
        alertMock.mockRestore();
    });

    test("opens product modal with details", async () => {
        const mockProduct: Product = {
            id: "1",
            productName: "Product A",
            price: 10,
            category: "Category A",
            imageURL: "imgA.jpg",
            description: "Description A",
            seller: "sellerA@example.com",
            sold: false,
            markAsSold: jest.fn(), //  Add mock function
            updateDetails: jest.fn(), //  Add mock function
            getSummary: jest.fn(() => "Product B - $20 (Category B)"), //  Add mock function
        };

        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: "user@example.com" });
            return jest.fn();
        });

        (getData as jest.Mock).mockResolvedValue([mockProduct]);

        render(<BrowsePage />);

        await waitFor(() => expect(screen.getByAltText("Product A")).toBeInTheDocument());

        fireEvent.click(screen.getByAltText("Product A"));

        await waitFor(() => expect(screen.getByText("Description A")).toBeInTheDocument());
    });

    test("shows error message on fetch failure", async () => {
        // Mock authentication
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: "user@example.com" });
            return jest.fn();
        });

        // Mock getData to simulate failure
        (getData as jest.Mock).mockRejectedValue(new Error("Fetch error"));

        render(<BrowsePage />);

        // Ensure "Loading products..." appears first
        expect(screen.getByText("Loading products...")).toBeInTheDocument();

        // Ensure error message is displayed after loading state disappears
        await waitFor(() => {
            expect(screen.queryByText("Loading products...")).not.toBeInTheDocument();
            expect(screen.getByText("Error fetching products. Please try again later.")).toBeInTheDocument();
        });
    });


    test("displays loading indicator", async () => {
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: "user@example.com" });
            return jest.fn();
        });

        render(<BrowsePage />);

        await waitFor(() => {
            expect(screen.getByText("Loading products...")).toBeInTheDocument();
        });
    });

    test("displays empty message when no products available", async () => {
        process.env.NEXT_PUBLIC_USE_FIRESTORE = "false"; // Use IndexedDB mode

        // Mock authenticated user
        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            callback({ email: "test@example.com" }); // Set user email
            return jest.fn(); // Ensure `unsubscribeAuth` is a function
        });

        // Ensure getData returns an empty array
        (getData as jest.Mock).mockResolvedValue([]);

        render(<BrowsePage />);

        // Ensure "Loading products..." disappears before checking for empty message
        await waitFor(() => {
            expect(screen.queryByText("Loading products...")).not.toBeInTheDocument();
        });

        // Ensure the empty message appears
        await waitFor(() =>
            expect(screen.getByText("No products available to browse.")).toBeInTheDocument()
        );
    });

});
