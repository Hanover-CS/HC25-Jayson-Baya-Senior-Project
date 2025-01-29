import React from "react";
import Modal from "@/components/Modal";
import { categories } from "@/Models/ConstantData";

interface Product {
    id: string;
    productName: string;
    price: number;
    category: string;
    imageURL: string;
    description: string;
    seller: string;
    sold?: boolean;
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
