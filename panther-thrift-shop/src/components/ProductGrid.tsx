import React from "react";
import { Product } from "@/Models/Product";

interface ProductGridProps {
    products?: Product[]; // Make this optional
    onProductClick?: (product: Product) => void;
    onSaveProduct?: (product: Product) => void;
    onSellerRedirect?: () => void;
    userEmail?: string;
    emptyMessage?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
                                                     products = [], // Default to an empty array
                                                     onProductClick,
                                                     onSaveProduct,
                                                     onSellerRedirect,
                                                     userEmail,
                                                     emptyMessage = "No items available yet.",
                                                 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
                products.map((product) => (
                    <div
                        key={product.id}
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
                                onClick={onSellerRedirect}
                                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                            >
                                Listings
                            </button>
                        ) : onSaveProduct ? (
                            <button
                                onClick={() => onSaveProduct(product)}
                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                            >
                                Save
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