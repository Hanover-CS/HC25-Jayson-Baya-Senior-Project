import React, {useEffect, useState} from "react";
import { Product } from "@/Models/Product";
import {fetchFirestoreData} from "@/utils/fetchFirestoreData";
import {FIRESTORE_COLLECTIONS, FIRESTORE_FIELDS} from "@/Models/ConstantData";

interface ProductGridProps {
    products?: Product[]; // Make this optional
    onProductClick?: (product: Product) => void;
    onSaveProduct?: (product: Product) => void;
    onSellerRedirect?: () => void;
    userEmail?: string;
    emptyMessage?: string;
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

    useEffect(() => {
        const fetchSavedProducts = async () => {
            if (userEmail) {
                const savedItems = await fetchFirestoreData(
                    FIRESTORE_COLLECTIONS.SAVED_ITEMS,
                    userEmail,
                    FIRESTORE_FIELDS.BUYER_EMAIL
                );
                const savedIds = new Set(savedItems.map((item: Product) => item.id));
                setSavedProductIds(savedIds);
            }
        };

        fetchSavedProducts();
    }, [userEmail]);

    // Wrap the save/unsave logic
    const toggleSaveProduct = async (product: Product) => {
        if (savedProductIds.has(product.id)) {
            setSavedProductIds((prev) => {
                const updated = new Set(prev);
                updated.delete(product.id);
                return updated;
            });
        } else {
            setSavedProductIds((prev) => {
                const updated = new Set(prev);
                updated.add(product.id);
                return updated;
            });
        }

        // Call the parent handler
        onSaveProduct?.(product);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
                products.map((product, index) => (
                    <div
                        key={product.id || index}
                        className="bg-white p-4 shadow rounded cursor-pointer"
                    >
                        <img
                            src={product.imageURL}
                            alt={product.productName}
                            className="w-full h-48 object-contain mb-4"
                            onClick={() => onProductClick?.(product)}
                        />
                        <h2 className="text-lg font-semibold">{product.productName}</h2>
                        <p className="text-gray-600">${product.price}</p>
                        <p className="text-gray-500">{product.description}</p>
                        {userEmail && product.seller === userEmail ? (
                            <button
                                onClick={() => onSellerRedirect?.()}
                                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                            >
                                Listings
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
                                {savedProductIds.has(product.id) ? "Saved" : "Save"}
                            </button>
                        ) : null}
                    </div>
                ))
            ) : (
                <p className="text-center col-span-full">{emptyMessage}</p>
            )}
        </div>
    );
};

export default ProductGrid;
