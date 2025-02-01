"use client";

import React from "react";
import Modal from "@/components/Modal"; // Your existing Modal component
import { Product } from "@/Models/Product";

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
    if (!isOpen || !product) return null;

    return (
        <Modal onClose={onClose}>
            <div role="dialog" className="p-6 bg-white rounded shadow-lg">
                <h2 className="text-xl font-bold mb-4">{product.productName}</h2>
                <img
                    src={product.imageURL}
                    alt={product.productName}
                    className="w-full h-48 object-contain mb-4"
                />
                <p className="text-gray-600 mb-2">Price: ${product.price}</p>
                <p className="text-gray-600 mb-2">Category: {product.category}</p>
                <p className="text-gray-600 mb-4">Description: {product.description}</p>
                <p className="text-gray-600 font-bold">Seller: {product.seller}</p>

            </div>
        </Modal>
    );
};


export default ProductModal;
