/**
 * CreateListingForm.tsx
 *
 * This file defines the CreateListingForm component for the Panther Thrift Shop web application.
 * The component renders a form that allows sellers to create a new product listing. Users can enter
 * product details such as name, select a category from a predefined list, specify the price, add a
 * description, and upload a product image. Upon clicking the "Create Listing" button, the provided
 * handleCreateListing function is triggered to process and submit the listing data.
 *
 * Props:
 * - name: A string representing the product name.
 * - setName: A function to update the product name.
 * - category: A string representing the selected category.
 * - setCategory: A function to update the selected category.
 * - price: A number representing the product price.
 * - setPrice: A function to update the product price.
 * - description: A string representing the product description.
 * - setDescription: A function to update the product description.
 * - setImage: A function to set the product image file.
 * - handleCreateListing: A function that is called when the "Create Listing" button is clicked to submit the form.
 *
 * Dependencies:
 * - React for building the component.
 * - The categories array from "@/Models/ConstantData" to populate the category dropdown.
 *
 * Author: Jayson Baya
 * Last Updated: February 2, 2025
 */


import React from "react";
import { categories } from "@/Models/ConstantData";

interface CreateListingFormProps {
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    category: string;
    setCategory: React.Dispatch<React.SetStateAction<string>>;
    price: number;
    setPrice: React.Dispatch<React.SetStateAction<number>>;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setImage: React.Dispatch<React.SetStateAction<File | null>>;
    handleCreateListing: () => void;
}

const CreateListingForm: React.FC<CreateListingFormProps> = ({
                                                                 name,
                                                                 setName,
                                                                 category,
                                                                 setCategory,
                                                                 price,
                                                                 setPrice,
                                                                 description,
                                                                 setDescription,
                                                                 setImage,
                                                                 handleCreateListing,
                                                             }) => {
    return (
        <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto mb-6">
            <h2 className="text-xl font-bold mb-4">Create New Listing</h2>
            <div className="mb-4">
                <label className="block mb-2 text-gray-700">Product Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mb-4">
                <label className="block mb-2 text-gray-700">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mb-4">
                <label className="block mb-2 text-gray-700">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mb-4">
                <label className="block mb-2 text-gray-700">Product Image</label>
                <input
                    type="file"
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            setImage(e.target.files[0]);
                        }
                    }}
                    className="w-full"
                />
            </div>

            <button
                onClick={handleCreateListing}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            >
                Create Listing
            </button>
        </div>
    );
};

export default CreateListingForm;
