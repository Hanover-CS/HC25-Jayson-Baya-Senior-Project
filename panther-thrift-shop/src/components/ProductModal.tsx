/**
 * ProductModal.tsx
 *
 * This file defines the ProductModal component for the Panther Thrift Shop web application.
 * The ProductModal component displays detailed information about a selected product in a modal popup.
 * It is designed to be used as an overlay that appears when a product is clicked, providing
 * additional details such as the product image, price, category, description, and seller information.
 *
 * Key Features:
 * - Renders a modal dialog to display product details.
 * - Displays essential product information including product name, image, price, category, description, and seller.
 * - Only renders when both the `isOpen` flag is true and a valid `product` object is provided.
 *
 * Props:
 * - product (Product | null): The product object containing details to display in the modal. If null, the modal will not render.
 * - isOpen (boolean): A flag indicating whether the modal should be visible.
 * - onClose (function): A callback function that is invoked to close the modal.
 *
 * Dependencies:
 * - React for component creation and rendering.
 * - A custom Modal component (imported from "@/components/Modal") for the modal overlay and basic styling.
 * - Product model from "@/Models/Product" to ensure consistent structure of the product data.
 *
 * Author: Jayson Baya
 * Last Updated: January 25, 2025
 */


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
