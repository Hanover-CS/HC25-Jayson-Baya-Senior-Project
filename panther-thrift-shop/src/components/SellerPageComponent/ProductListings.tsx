/**
 * ProductListings.tsx
 *
 * This file defines the ProductListings component for the Panther Thrift Shop web application.
 * The component displays a grid layout of product listings for sellers to view their items.
 * Each listing includes an image, product name, price, description, and an indicator of whether the
 * product is sold or still available. Clicking on a product listing triggers the provided callback
 * to enable editing of the product details.
 *
 * Key Features:
 * - Renders a responsive grid of product listings using Tailwind CSS.
 * - Displays essential product details including image, name, price, description, and sale status.
 * - Provides visual cues for the sale status (e.g., "Sold" in red for sold products, "Still Selling" in green for available products).
 * - Each product listing is clickable, triggering a callback to facilitate editing.
 *
 * Dependencies:
 * - React for component creation and rendering.
 * - Tailwind CSS for responsive styling and layout.
 *
 * Author: Jayson Baya
 * Last Updated: February 2, 2025
 */


import React from "react";

interface Product extends Record<string, unknown>{
    id: string;
    productName: string;
    price: number;
    category: string;
    imageURL: string;
    description: string;
    seller: string;
    sold: boolean;
    createdAt: string;
    buyerEmail: string;
    purchaseDate: string;
}

interface ProductListingsProps {
    products: Product[];
    handleEditProduct: (product: Product) => void;
}

const ProductListings: React.FC<ProductListingsProps> = ({
                                                             products,
                                                             handleEditProduct,
                                                         }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">My Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div
                            key={product.id} // Ensure the unique `id` field is used
                            onClick={() => handleEditProduct(product)}
                            className="bg-white p-4 shadow rounded cursor-pointer"
                        >
                            <img
                                src={product.imageURL}
                                alt={product.productName}
                                className="w-full h-48 object-contain mb-4"
                            />
                            <h2 className="text-lg font-semibold">{product.productName}</h2>
                            <p className="text-gray-600">${product.price}</p>
                            <p className="text-gray-500">{product.description}</p>
                            {product.sold ? (
                                <p className="text-red-500 font-bold">Sold</p>
                            ) : (
                                <p className="text-green-500 font-bold">Still Selling</p>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No listings found.</p>
                )}
            </div>
        </div>
    );
};

export default ProductListings;
