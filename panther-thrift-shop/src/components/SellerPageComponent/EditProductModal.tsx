/**
 * EditProductModal.tsx
 *
 * This file defines the EditProductModal component for the Panther Thrift Shop web application.
 * The EditProductModal component renders a modal form that allows sellers to edit the details of an
 * existing product listing. Sellers can update fields such as product name, category, price, description,
 * and sold status. When a product is marked as sold, the modal prompts the seller to provide the buyer's email.
 *
 * Key Features:
 * - Renders a modal interface for editing product details.
 * - Editable fields include product name, category, price, description, and sale status.
 * - Conditional input for buyer email when the product is marked as sold.
 * - Uses controlled inputs to update the product state via provided setter functions.
 *
 * Props:
 * - selectedProduct: The current product object being edited (or null if no product is selected).
 * - setSelectedProduct: Function to update the selected product's state.
 * - setShowEditModal: Function to toggle the visibility of the edit modal.
 * - handleUpdateProduct: Function invoked when the "Update Product" button is clicked to save changes.
 *
 * Dependencies:
 * - React for component rendering and state management.
 * - Modal component from "@/components/Modal" for modal display.
 * - The categories array from "@/Models/ConstantData" to populate the category dropdown.
 *
 * Author: Jayson Baya
 * Last Updated: February 2, 2025
 */


import React from "react";
import Modal from "@/components/Modal";
import { categories } from "@/Models/ConstantData";

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

interface EditProductModalProps {
    selectedProduct: Product | null;
    setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
    setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;
    handleUpdateProduct: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
                                                               selectedProduct,
                                                               setSelectedProduct,
                                                               setShowEditModal,
                                                               handleUpdateProduct,
                                                           }) => {
    if (!selectedProduct) return null;

    return (
        <Modal onClose={() => setShowEditModal(false)}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Edit Product</h2>

                <div className="mb-4">
                    <label className="block mb-2 text-gray-700">Product Name</label>
                    <input
                        type="text"
                        value={selectedProduct.productName}
                        onChange={(e) =>
                            setSelectedProduct((prev) => ({
                                ...prev!,
                                productName: e.target.value,
                            }))
                        }
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-gray-700">Category</label>
                    <select
                        value={selectedProduct.category}
                        onChange={(e) =>
                            setSelectedProduct((prev) => ({
                                ...prev!,
                                category: e.target.value,
                            }))
                        }
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select Category</option>
                        {categories.map((category, idx) => (
                            <option key={idx} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-gray-700">Price</label>
                    <input
                        type="number"
                        value={selectedProduct.price}
                        onChange={(e) =>
                            setSelectedProduct((prev) => ({
                                ...prev!,
                                price: Number(e.target.value),
                            }))
                        }
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-gray-700">Description</label>
                    <textarea
                        value={selectedProduct.description}
                        onChange={(e) =>
                            setSelectedProduct((prev) => ({
                                ...prev!,
                                description: e.target.value,
                            }))
                        }
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-gray-700">Status</label>
                    <select
                        value={selectedProduct.sold ? "Sold" : "Still Selling"}
                        onChange={(e) =>
                            setSelectedProduct((prev) => ({
                                ...prev!,
                                sold: e.target.value === "Sold",
                            }))
                        }
                        className="w-full p-2 border rounded"
                    >
                        <option value="Still Selling">Still Selling</option>
                        <option value="Sold">Sold</option>
                    </select>
                </div>

                {/* Buyer Email Field - Required when marking as Sold */}
                {selectedProduct.sold && (
                    <div className="mb-4">
                        <label className="block mb-2 text-gray-700">Buyer Email</label>
                        <input
                            type="email"
                            value={selectedProduct.buyerEmail || ""}
                            onChange={(e) =>
                                setSelectedProduct((prev) => ({
                                    ...prev!,
                                    buyerEmail: e.target.value,
                                }))
                            }
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    )}

                <button
                    onClick={handleUpdateProduct}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                >
                    Update Product
                </button>
            </div>
        </Modal>
    );
};

export default EditProductModal;
