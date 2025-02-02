/**
 * BuyingPage.tsx
 *
 * This file defines the BuyingPage component for the Panther Thrift Shop web application.
 * The BuyingPage serves as the primary dashboard for buyers, providing them with the ability to:
 * - View their saved items.
 * - Check their purchase history.
 *
 * Note: The "Offers" feature has been deprioritized and is not included in the current implementation.
 *
 * The component fetches data in real-time from Firebase Firestore and organizes it into two main tabs:
 * "Saved Items" and "Purchased Orders". Buyers can seamlessly navigate between these tabs to manage their
 * items and review their purchasing activities.
 *
 * Key Features:
 * - Real-time data fetching for saved items and purchased orders from Firestore.
 * - User authentication using Firebase Auth; unauthenticated users are redirected to the login page.
 * - Responsive, tab-based UI for easy navigation between different sections.
 * - Detailed product display using the ProductGrid component.
 * - Product details are presented in a modal popup via the ProductModal component when an item is clicked.
 *
 * Dependencies:
 * - Firebase Auth for managing user authentication.
 * - Firebase Firestore for real-time data retrieval.
 * - Next.js useRouter for client-side navigation and redirection.
 * - ProductGrid component for rendering the grid layout of products.
 * - ProductModal component for displaying detailed product information in a modal.
 * - Custom utility function getData from dbHandler for querying Firestore.
 *
 * Author: Jayson Baya
 * Last Updated: February 2, 2025
 */


"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import {getData} from "@/lib/dbHandler"; // Import the dbHandler function
import {
    FIRESTORE_COLLECTIONS,
    FIRESTORE_FIELDS,
    renderTabContentMessage,
    ROUTES,
} from "@/Models/ConstantData";
import { TAB_NAMES } from "@/Models/ConstantData";
import ProductGrid from "@/components/ProductGrid";
import { Product } from "@/Models/Product";
import ProductModal from "@/components/ProductModal";

const BuyingPage = () => {
    const [savedItems, setSavedItems] = useState<Product[]>([]); // Saved items
    const [purchasedItems, setPurchasedItems] = useState<Product[]>([]); // Purchased items
    const [selectedTab, setSelectedTab] = useState(TAB_NAMES.SAVED_ITEMS); // Active tab
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const router = useRouter();

    const fetchPurchasedItems = async (email: string) => {
        try {
            const purchasedItemsData = await getData<Product>(
                FIRESTORE_COLLECTIONS.PURCHASED_ITEMS,
                [{
                    field: FIRESTORE_FIELDS.BUYER_EMAIL,
                    operator: "==",
                    value: email
                }]
            );

            setPurchasedItems(purchasedItemsData);
        } catch (error) {
            console.error("Error fetching purchased items:", error);
        }
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const email = user.email || "";

                try {
                    // Fetch saved items
                    const savedItemsData = await getData<Product>(FIRESTORE_COLLECTIONS.SAVED_ITEMS, [{
                        field: FIRESTORE_FIELDS.BUYER_EMAIL,
                        operator: "==",
                        value: email
                    }]);
                    setSavedItems(savedItemsData);

                    // Fetch purchased items
                    await fetchPurchasedItems(email);

                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            } else {
                router.push(ROUTES.LOGIN); // Redirect to login if not authenticated
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Handle product click to show details in modal
    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
    };


    // Render tab content based on the active tab
    const renderTabContent = () => {
        switch (selectedTab) {
            case TAB_NAMES.SAVED_ITEMS:
                return (
                    <ProductGrid
                        products={savedItems}
                        onProductClick={handleProductClick} // Makes items clickable
                        userEmail={auth.currentUser?.email || ""}
                        showSaveButton={true}
                        emptyMessage={renderTabContentMessage.emptySaved}
                    />
                );
            case TAB_NAMES.PURCHASED_ORDERS:
                return (
                    <ProductGrid
                        products={purchasedItems}
                        onProductClick={handleProductClick}
                        userEmail={auth.currentUser?.email || ""}
                        showSaveButton={false}
                        emptyMessage={renderTabContentMessage.emptyPurchased}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex flex-grow">
                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-6">My Buying Page</h1>

                    {/* Tabs */}
                    <div className="mb-4">
                        {Object.values(TAB_NAMES).map((tabName) => (
                            <button
                                key={tabName}
                                onClick={() => setSelectedTab(tabName)}
                                className={`px-4 py-2 ${
                                    selectedTab === tabName
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200"
                                }`}
                            >
                                {tabName}
                            </button>
                        ))}
                    </div>

                    {/* Render Content */}
                    {renderTabContent()}
                </div>
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
    );
};

export default BuyingPage;
