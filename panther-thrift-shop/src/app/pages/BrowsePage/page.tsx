/**
 * BrowsePage.tsx
 *
 * This file defines the BrowsePage component, which serves as the primary
 * interface for browsing available products on the Panther Thrift Shop web application.
 * The component is responsible for:
 *
 * - **User Authentication:** It listens for authentication state changes using
 *   Firebase Auth. Unauthenticated users are redirected to the login page.
 * - **Product Retrieval:** It fetches a real-time list of unsold products from
 *   Firebase Firestore using a custom `getData` function.
 * - **Product Display:** It renders the fetched products in a grid layout using
 *   the `ProductGrid` component.
 * - **Product Details:** When a product is clicked, detailed information is shown
 *   in a modal popup via the `ProductModal` component.
 * - **Seller Redirection:** If the current user interacts with their own product,
 *   the component can redirect them to the seller's page.
 *
 * Key Features:
 * - Real-time fetching of unsold products from Firestore.
 * - Conditional rendering based on authentication and data loading states.
 * - Modular UI using `ProductGrid` for displaying products and `ProductModal` for
 *   detailed views.
 * - Navigation management with Next.js' `useRouter`.
 *
 * Dependencies:
 * - **React:** For state management and component rendering.
 * - **Next.js:** For client-side navigation using `useRouter`.
 * - **Firebase Auth:** To handle user authentication.
 * - **Firebase Firestore:** For storing and fetching product data in real-time.
 * - **ProductGrid Component:** Renders the grid view of available products.
 * - **ProductModal Component:** Displays detailed information about a selected product.
 * - **Custom Utilities:** The `getData` function from `dbHandler` is used to query Firestore.
 *
 * Author: Jayson Baya
 * Last Updated: February 2, 2025
 */


"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { Product } from "@/Models/Product";
import {
    FIRESTORE_COLLECTIONS,
    FIRESTORE_FIELDS,
    ROUTES,
    fetchProductsAlert,
} from "@/Models/ConstantData";
import { getData } from "@/lib/dbHandler"; // Use dbHandler functions
import ProductGrid from "@/components/ProductGrid";
import ProductModal from "@/components/ProductModal"; // Modal for product details

const BrowsePage = () => {
    const [userEmail, setUserEmail] = useState<string>("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showProductModal, setShowProductModal] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
            if (user) {
                setUserEmail(user.email || "");
                fetchProducts(); // Fetch products when authenticated
            } else {
                router.push(ROUTES.LOGIN); // Redirect to login if not authenticated
            }
        });

        return () => unsubscribeAuth(); // Cleanup on unmount
    }, [router]);

    // Fetch products from the database
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const fetchedProducts = await getData<Product>(FIRESTORE_COLLECTIONS.PRODUCTS, [
                { field: FIRESTORE_FIELDS.sold, operator: "==", value: false },
            ]) || [];

            setProducts(fetchedProducts);
        } catch {
            setError(fetchProductsAlert.Alert);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };


    // Handle product click to open modal
    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
    };

    // Redirect to seller's page
    const handleSellerRedirect = () => {
        router.push(ROUTES.SELLERS_PAGE);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex flex-grow">
                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-4">Browse All Products</h1>

                    {loading ? (
                        <p>Loading products...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <ProductGrid
                            products={products}
                            onProductClick={handleProductClick}
                            onSellerRedirect={handleSellerRedirect}
                            userEmail={userEmail}
                            emptyMessage="No products available to browse."
                            showSaveButton={true}/>
                    )}
                </div>

                {/* Product Details Modal */}
                {showProductModal && selectedProduct && (
                    <ProductModal
                        product={selectedProduct}
                        isOpen={showProductModal}
                        onClose={() => setShowProductModal(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default BrowsePage;
