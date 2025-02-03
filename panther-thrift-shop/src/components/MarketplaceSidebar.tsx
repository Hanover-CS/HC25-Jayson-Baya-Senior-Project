/**
 * MarketplaceSidebar.tsx
 *
 * This file defines the `MarketplaceSidebar` component for the Panther Thrift Shop web application.
 * The `MarketplaceSidebar` provides navigation links for users to browse products, view buying history,
 * and manage their selling listings. It also includes a list of product categories for easy navigation.
 * The sidebar highlights the currently selected section or category and updates the selected state.
 *
 * Key Features:
 * - Navigation links for special sections: "Browse All", "Buying", and "Selling".
 * - List of product categories: Men's Clothing, Women's Clothing, Appliances, Room Decoration, Textbooks.
 * - Highlights the selected section or category for better user experience.
 * - Uses Next.js `useRouter` for client-side navigation.
 * - Responsive design using Tailwind CSS.
 *
 * Dependencies:
 * - Next.js `useRouter` for handling navigation.
 *
 * Author: Jayson Baya
 * Last Updated: November 14, 2024
 */

import React from "react";
import { useRouter } from "next/navigation"; // Import useRouter

interface SidebarProps {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
}

const MarketplaceSidebar: React.FC<SidebarProps> = ({ selectedCategory }: SidebarProps) => {
    const router = useRouter(); // Initialize router

    const specialSections = [
        { name: "Browse All", path: "/pages/BrowsePage" },  // Add paths
        { name: "Buying", path: "/pages/BuyingPage" },
        { name: "Selling", path: "/pages/SellersPage" },
    ];

    // const categories = [
    //     { name: "Men's Clothing", path: "/marketplace/mens-clothing" },
    //     { name: "Women's Clothing", path: "/marketplace/womens-clothing" },
    //     { name: "Appliances", path: "/marketplace/appliances" },
    //     { name: "Room Decoration", path: "/marketplace/room-decoration" },
    //     { name: "Textbooks", path: "/marketplace/textbooks" },
    // ];

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
            {/*<h3 className="text-lg font-semibold mb-2">Categories</h3>*/}

            {/* Categories */}
            {/*{categories.map((category, idx) => (*/}
            {/*    <button*/}
            {/*        key={idx}*/}
            {/*        onClick={() => handleNavigation(category.path)} // Navigate to the category path*/}
            {/*        className={`block text-left w-full text-gray-700 hover:bg-gray-200 p-2 rounded ${*/}
            {/*            selectedCategory === category.name ? "bg-gray-200" : ""*/}
            {/*        }`}*/}
            {/*    >*/}
            {/*        {category.name}*/}
            {/*    </button>*/}
            {/*))}*/}
        </div>
    );
};

export default MarketplaceSidebar;
