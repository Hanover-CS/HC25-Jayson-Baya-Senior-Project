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

import React, {useEffect, useState} from "react";
import {Product} from "@/Models/Product";
import {FIRESTORE_COLLECTIONS, FIRESTORE_FIELDS} from "@/Models/ConstantData";
import {addData, deleteData, getData} from "@/lib/dbHandler";

interface ProductGridProps {
    products?: Product[],
    onProductClick?: (product: Product) => void,
    onSellerRedirect?: () => void,
    userEmail?: string,
    emptyMessage?: string
}

const ProductGrid: React.FC<ProductGridProps> = ({
                                                     products = [],
                                                     onProductClick,
                                                     onSellerRedirect,
                                                     userEmail,
                                                     emptyMessage = "No items available yet.",
                                                 }) => {
    const [savedProductIds, setSavedProductIds] = useState<Set<string>>(new Set());

    // Fetch saved products for the logged-in user
    useEffect(() => {
        const fetchSavedProducts = async () => {
            if (!userEmail) return;

            try {
                const savedItems = await getData<Product>(
                    FIRESTORE_COLLECTIONS.SAVED_ITEMS,
                    [{field: FIRESTORE_FIELDS.BUYER_EMAIL, operator: "==", value: userEmail}]
                );

                // Store saved product IDs in a Set for fast lookup
                const savedIds = new Set(savedItems.map((item) => item.id));
                setSavedProductIds(savedIds);
            } catch (error) {
                console.error("Error fetching saved products:", error);
            }
        };

        fetchSavedProducts();
    }, [userEmail]);


    // Handle saving or unsaving a product
    const toggleSaveProduct = async (product: Product) => {
        if (!userEmail) return;

        const isSaved = savedProductIds.has(product.id);
        try {
            if (isSaved) {
                // Unsaved the product (Delete from Firestore/IndexedDB)
                await deleteData(FIRESTORE_COLLECTIONS.SAVED_ITEMS, product.id);
                setSavedProductIds((prev) => {
                    const updated = new Set(prev);
                    updated.delete(product.id);
                    return updated;
                });

            } else {
                // Save the product (Add to Firestore/IndexedDB)
                const savedProduct = {
                    id: product.id,
                    buyerEmail: userEmail,
                    productName: product.productName,
                    price: product.price,
                    imageURL: product.imageURL,
                    description: product.description,
                    category: product.category,
                    seller: product.seller,
                    createdAt: new Date().toISOString(),
                };

                await addData(FIRESTORE_COLLECTIONS.SAVED_ITEMS, savedProduct);
                setSavedProductIds((prev) => new Set(prev).add(product.id));
            }
        } catch (error) {
            console.error("Error saving/unsaving product:", error);
        }
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

                        {/* Show 'My Listings' if Seller, otherwise 'Save'/'Saved' */}
                        {userEmail && product.seller === userEmail ? (
                            <button
                                onClick={onSellerRedirect}
                                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                            >
                                My Listings
                            </button>
                        ) : (
                            <button
                                onClick={() => toggleSaveProduct(product)}
                                className={`mt-2 px-4 py-2 rounded transition ${
                                    savedProductIds.has(product.id)
                                        ? "bg-red-500 text-white hover:bg-red-600"
                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                            >
                                {savedProductIds.has(product.id) ? "Saved" : "Save"}
                            </button>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-center col-span-full text-gray-500">{emptyMessage}</p>
            )}
        </div>
    );
};

export default ProductGrid;
