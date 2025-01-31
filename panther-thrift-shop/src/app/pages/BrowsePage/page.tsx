/**
 * BrowsePage.tsx
 *
 * This file defines the `BrowsePage` component for the Panther Thrift Shop web application.
 * The `BrowsePage` serves as the main homepage for users and buyers, allowing them to view
 * available products and save items for later. It displays product listings in real-time,
 * fetching data from Firebase Firestore. Users can click on products to view details,
 * save products to their saved items list, or redirect to the seller's listings if they
 * are the product owner.
 *
 * Key Features:
 * - Real-time product listings using Firebase Firestore.
 * - Category-based browsing with a sidebar navigation.
 * - Save item functionality for buyers.
 * - Modal pop-up for viewing product details.
 * - Redirects to the seller's page if the current user is the product owner.
 *
 * Dependencies:
 * - Firebase Auth for user authentication.
 * - Firebase Firestore for real-time product data.
 * - `MarketplaceNavBar` and `MarketplaceSidebar` components for navigation.
 * - `Modal` component for displaying product details.
 *
 * Author: Jayson Baya
 * Last Updated: November 14, 2024
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
                {field: FIRESTORE_FIELDS.sold, operator: "==", value: false},
            ]);
            setProducts(fetchedProducts);
        } catch (error) {
            console.error(fetchProductsAlert.Error, error);
            setError(fetchProductsAlert.Alert);
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
                        />
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
