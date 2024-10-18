"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {onAuthStateChanged, signOut} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import MarketplaceNavBar from "@/app/components/MarketplaceNavbar"; // Import the Navbar

const Marketplace = () => {
    const [userEmail, setUserEmail] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Browse All"); // Default selection
    const router = useRouter();

    const categories = [
        { name: "Men's Clothing", subcategories: ["Shirts", "Pants", "Shoes"] },
        { name: "Women's Clothing", subcategories: ["Shirts", "Pants", "Shoes"] },
        { name: "Appliances" },
        { name: "Room Decoration" },
        { name: "Textbooks" },
    ];

    // Listen to the authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
            } else {
                router.push("/pages/Login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/pages/Login");
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Include the Navbar at the top */}
            <MarketplaceNavBar />

            <div className="flex flex-grow">
                {/* Sidebar */}
                <div className="w-64 bg-gray-100 p-4 space-y-4">
                    <button
                        onClick={() => handleCategoryClick("Browse All")}
                        className="block text-left w-full text-gray-700 hover:bg-gray-200 p-2 rounded">
                        Browse All
                    </button>
                    <button
                        onClick={() => handleCategoryClick("Buying")}
                        className="block text-left w-full text-gray-700 hover:bg-gray-200 p-2 rounded">
                        Buying
                    </button>
                    <button
                        onClick={() => handleCategoryClick("Selling")}
                        className="block text-left w-full text-gray-700 hover:bg-gray-200 p-2 rounded">
                        Selling
                    </button>

                    {/* Categories */}
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Categories</h3>
                        {categories.map((category, index) => (
                            <div key={index}>
                                <button
                                    onClick={() => handleCategoryClick(category.name)}
                                    className="block text-left w-full text-gray-700 hover:bg-gray-200 p-2 rounded">
                                    {category.name}
                                </button>

                                {/* Subcategories */}
                                {category.subcategories &&
                                    category.subcategories.map((subcategory, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleCategoryClick(subcategory)}
                                            className="ml-4 block text-left w-full text-gray-500 hover:bg-gray-200 p-2 rounded">
                                            {subcategory}
                                        </button>
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-4">{selectedCategory}</h1>
                    {/* Display products here based on the selected category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Example Product Item (you can replace this with dynamic content) */}
                        <div className="bg-white p-4 shadow rounded">
                            <h2 className="text-lg font-semibold">Product Name</h2>
                            <p className="text-gray-600">$Price</p>
                        </div>
                        {/* Repeat Product Items */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
