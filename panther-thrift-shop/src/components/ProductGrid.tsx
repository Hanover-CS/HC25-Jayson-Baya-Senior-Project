import React from "react";
import { Product } from "@/Models/Product";

interface ProductGridProps {
    products: Product[];
    emptyMessage: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, emptyMessage }) => {
    return products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
                <div key={index} className="bg-white p-4 shadow rounded">
                    <img
                        src={product.imageURL}
                        alt={product.productName}
                        className="w-full h-48 object-contain mb-4"
                    />
                    <h2 className="text-lg font-semibold">{product.productName}</h2>
                    <p className="text-gray-600">${product.price}</p>
                    <p className="text-gray-500">{product.description}</p>
                </div>
            ))}
        </div>
    ) : (
        <p>{emptyMessage}</p>
    );
};

export default ProductGrid;
