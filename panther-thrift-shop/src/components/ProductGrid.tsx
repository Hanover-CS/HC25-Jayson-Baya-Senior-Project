/**
 * ProductGrid.tsx
 *
 * This file defines the ProductGrid component for the Panther Thrift Shop web application.
 * The ProductGrid component renders a responsive grid of product cards with the following features:
 * - Displays product details such as image, name, price, and description.
 * - Allows a logged-in user to save or unsave products, updating the saved products collection in Firestore (or IndexedDB).
 * - Redirects the seller to their own listings if the logged-in user is the owner of the product.
 *
 * Key Features:
 * - Renders a grid layout using Tailwind CSS for responsive design.
 * - Enables product detail viewing through the onProductClick callback.
 * - Provides a "Save" / "Saved" button that toggles a product's saved status for the logged-in user.
 * - Displays a "My Listings" button for products owned by the logged-in user, which triggers the onSellerRedirect callback.
 * - Shows a customizable empty state message when no products are available.
 *
 * Props:
 * - products (Product[]): An array of product objects to be displayed.
 * - onProductClick (function): Callback invoked when a product is clicked to view its details.
 * - onSellerRedirect (function): Callback invoked when a seller wants to view their own listings.
 * - userEmail (string): The email of the logged-in user, used to determine ownership and saved status.
 * - emptyMessage (string): A message to display when there are no products available.
 * - showSaveButton (boolean): Flag to control whether the save/unsave button is rendered.
 *
 * Dependencies:
 * - React for component creation and state management.
 * - Firebase Firestore (via getData, addData, deleteData functions) for fetching and updating saved products.
 * - Tailwind CSS for styling and responsive layout.
 * - Constant values from "@/Models/ConstantData" for Firestore collection and field names, as well as alert messages.
 *
 * Author: Jayson Baya
 * Last Updated: January 25, 2025
 */


import React, {useEffect, useState} from "react";
import {Product} from "@/Models/Product";
import {FIRESTORE_COLLECTIONS, FIRESTORE_FIELDS, handleSaveProductAlert} from "@/Models/ConstantData";
import {addData, deleteData, getData} from "@/lib/dbHandler";

interface ProductGridProps {
    products?: Product[],
    onProductClick?: (product: Product) => void,
    onSellerRedirect?: () => void,
    userEmail?: string,
    emptyMessage?: string
    showSaveButton: boolean
}

const ProductGrid: React.FC<ProductGridProps> = ({
                                                     products = [],
                                                     onProductClick,
                                                     onSellerRedirect,
                                                     userEmail,
                                                     showSaveButton = true,
                                                     emptyMessage = "No items available yet.",
                                                 }) => {
    const [savedProductIds, setSavedProductIds] = useState<Set<string>>(new Set());

    // Fetch saved products for the logged-in user
    useEffect(() => {
        const fetchSavedProducts = async () => {
            if (!userEmail) return;

            try {
                const savedItems = (await getData<Product>(
                    FIRESTORE_COLLECTIONS.SAVED_ITEMS,
                    [{ field: FIRESTORE_FIELDS.BUYER_EMAIL, operator: "==", value: userEmail }]
                )) || []; // array

                // Store saved product IDs in a Set for fast lookup
                const savedIds = new Set(savedItems.map((item) => item.id));
                setSavedProductIds(savedIds);
            } catch (error) {
                console.error("Error fetching saved products:", error);
                setSavedProductIds(new Set()); // resets to an empty Set
            }
        };

        fetchSavedProducts();
    }, [userEmail]);


    // Handle saving or unsaving a product
    const toggleSaveProduct = async (product: Product, e: React.MouseEvent) => {
        e.stopPropagation();
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
                alert(handleSaveProductAlert.UNSAVED_ITEMS)
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
                alert(handleSaveProductAlert.SAVED_ITEMS)
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSellerRedirect?.();
                                }}
                                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                            >
                                My Listings
                            </button>
                        ) :  showSaveButton &&  (
                            <button
                                onClick={(e) => toggleSaveProduct(product, e)}
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
