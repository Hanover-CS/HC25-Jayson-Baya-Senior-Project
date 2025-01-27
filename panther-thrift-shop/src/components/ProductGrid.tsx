/**
 * ProductGrid.tsx
 *
 * This component renders a grid of products. It supports features such as:
 * - Clicking on a product to view details.
 * - Saving or unsaving products for a logged-in user.
 * - Redirecting to the seller's listings if the logged-in user owns the product.
 *
 * Dependencies:
 * - Firebase Firestore for fetching saved products.
 * - Tailwind CSS for styling.
 * - React state for managing UI interactions.
 *
 * Props:
 * - `products`: List of products to display.
 * - `onProductClick`: Callback when a product is clicked.
 * - `onSaveProduct`: Callback to save/unsave a product.
 * - `onSellerRedirect`: Callback to redirect to the seller's listings.
 * - `userEmail`: Logged-in user's email.
 * - `emptyMessage`: Message to display when no products are available.
 *
 * Author: Jayson Baya
 * Last Updated: January 25, 2025
 */

import React, { useEffect, useState } from "react";
import { Product } from "@/Models/Product";
import { fetchFirestoreData } from "@/utils/fetchFirestoreData"; // Abstracted Firestore utility
import { FIRESTORE_COLLECTIONS, FIRESTORE_FIELDS } from "@/Models/ConstantData";

interface ProductGridProps {
    products?: Product[]; // List of products to display
    onProductClick?: (product: Product) => void; // Callback when a product is clicked
    onSaveProduct?: (product: Product) => void; // Callback for saving/unsaving a product
    onSellerRedirect?: () => void; // Callback to redirect to the seller's listings
    userEmail?: string; // Logged-in user's email
    emptyMessage?: string; // Message to display when no products are available
}

const ProductGrid: React.FC<ProductGridProps> = ({
                                                     products = [],
                                                     onProductClick,
                                                     onSaveProduct,
                                                     onSellerRedirect,
                                                     userEmail,
                                                     emptyMessage = "No items available yet.",
                                                 }) => {
    const [savedProductIds, setSavedProductIds] = useState<Set<string>>(new Set());

    // Fetch saved products for the logged-in user
    useEffect(() => {
        const fetchSavedProducts = async () => {
            if (userEmail) {
                try {
                    const savedItems = await fetchFirestoreData<Product>(
                        FIRESTORE_COLLECTIONS.SAVED_ITEMS, // Collection name
                        userEmail, // User's email
                        FIRESTORE_FIELDS.BUYER_EMAIL, // BUYER_EMAIL field
                        [
                            {
                                field: FIRESTORE_FIELDS.BUYER_EMAIL,
                                operator: "==",
                                value: userEmail,
                            },
                        ]
                    );

                    const savedIds = new Set(savedItems.map((item) => item.id));
                    setSavedProductIds(savedIds);
                } catch (error) {
                    console.error("Error fetching saved products:", error);
                }
            }
        };

        fetchSavedProducts();
    }, [userEmail]);


    // Handle saving or unsaving a product
    const toggleSaveProduct = (product: Product) => {
        const isSaved = savedProductIds.has(product.id);

        setSavedProductIds((prev) => {
            const updated = new Set(prev);
            isSaved ? updated.delete(product.id) : updated.add(product.id);
            return updated;
        });

        // Trigger the parent callback
        onSaveProduct?.(product);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
                products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white p-4 shadow rounded cursor-pointer"
                    >
                        {/* Product Image */}
                        <img
                            src={product.imageURL}
                            alt={product.productName}
                            className="w-full h-48 object-contain mb-4"
                            onClick={() => onProductClick?.(product)}
                        />

                        {/* Product Details */}
                        <h2 className="text-lg font-semibold">{product.productName}</h2>
                        <p className="text-gray-600">${product.price.toFixed(2)}</p>
                        <p className="text-gray-500 truncate">{product.description}</p>

                        {/* Action Buttons */}
                        {userEmail && product.seller === userEmail ? (
                            <button
                                onClick={() => {
                                    if (onSellerRedirect) {
                                        onSellerRedirect();
                                    }
                                }}
                                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                            >
                                My Listings
                            </button>
                        ) : onSaveProduct ? (
                            <button
                                onClick={() => toggleSaveProduct(product)}
                                className={`mt-2 px-4 py-2 rounded transition ${
                                    savedProductIds.has(product.id)
                                        ? "bg-red-500 text-white hover:bg-red-600"
                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                            >
                                {savedProductIds.has(product.id) ? "Unsave" : "Save"}
                            </button>
                        ) : null}
                    </div>
                ))
            ) : (
                <p className="text-center col-span-full text-gray-500">{emptyMessage}</p>
            )}
        </div>
    );
};

export default ProductGrid;
