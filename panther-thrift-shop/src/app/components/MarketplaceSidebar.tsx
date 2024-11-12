import React from "react";
import { useRouter } from "next/navigation"; // Import useRouter

interface SidebarProps {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
}

const MarketplaceSidebar = ({ selectedCategory }: SidebarProps) => {
    const router = useRouter(); // Initialize router

    const specialSections = [
        { name: "Browse All", path: "/pages/BrowsePage" },  // Add paths
        { name: "Buying", path: "/pages/BuyingPage" },
        { name: "Selling", path: "/pages/SellersPage" },
    ];

    const categories = [
        { name: "Men's Clothing", path: "/marketplace/mens-clothing" },
        { name: "Women's Clothing", path: "/marketplace/womens-clothing" },
        { name: "Appliances", path: "/marketplace/appliances" },
        { name: "Room Decoration", path: "/marketplace/room-decoration" },
        { name: "Textbooks", path: "/marketplace/textbooks" },
    ];

    const handleNavigation = (path: string) => {
        router.push(path); // Navigate to the specified path
    };

    return (
        <div className="w-64 bg-gray-100 p-4 space-y-4">
            {/* Special Sections (Browse, Buying, Selling) */}
            {specialSections.map((section, idx) => (
                <button
                    key={idx}
                    onClick={() => handleNavigation(section.path)} // Navigate to the correct path
                    className={`block text-left w-full text-gray-700 hover:bg-gray-200 p-2 rounded ${
                        selectedCategory === section.name ? "bg-gray-200" : ""
                    }`}
                >
                    {section.name}
                </button>
            ))}

            {/* Divider between Special Sections and Categories */}
            <hr className="my-4 border-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Categories</h3>

            {/* Categories */}
            {categories.map((category, idx) => (
                <button
                    key={idx}
                    onClick={() => handleNavigation(category.path)} // Navigate to the category path
                    className={`block text-left w-full text-gray-700 hover:bg-gray-200 p-2 rounded ${
                        selectedCategory === category.name ? "bg-gray-200" : ""
                    }`}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
};

export default MarketplaceSidebar;
