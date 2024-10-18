"use client";
import { useState } from 'react';
import MarketplaceNavBar from '@/app/components/MarketplaceNavbar'; // Import your Navbar

const Marketplace = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true); // Toggle sidebar state

    const categories = [
        { name: "Men's Clothing", subcategories: ['Shirts', 'Pants', 'Shoes'] },
        { name: "Women's Clothing", subcategories: ['Shirts', 'Pants', 'Shoes'] },
        { name: 'Appliances' },
        { name: 'Room Decoration' },
        { name: 'Textbooks' }
    ];

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Include the minimalistic Navbar */}
            <MarketplaceNavBar />

            <div className="flex flex-grow">
                {/* Sidebar */}
                <div
                    className={`${
                        isSidebarOpen ? 'w-64' : 'w-16'
                    } bg-white shadow-md transition-all duration-300`}>
                    <button
                        className="p-2 bg-blue-500 text-white w-full text-left"
                        onClick={toggleSidebar}>
                        {isSidebarOpen ? 'Close Categories' : 'Open Categories'}
                    </button>

                    <div className="mt-4">
                        {isSidebarOpen && (
                            <ul className="space-y-4 p-4">
                                {categories.map((category, index) => (
                                    <li key={index} className="text-gray-700 font-bold">
                                        {category.name}
                                        {/* Subcategories (if any) */}
                                        {category.subcategories && (
                                            <ul className="ml-4 mt-2 space-y-2 text-sm">
                                                {category.subcategories.map((subcategory, idx) => (
                                                    <li key={idx} className="text-gray-600">
                                                        {subcategory}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-6">Marketplace</h1>
                    {/* Placeholder for product listings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Product Item (Example) */}
                        <div className="bg-white p-4 shadow rounded">
                            <h2 className="text-lg font-semibold">Product Name</h2>
                            <p className="text-gray-600">$Price</p>
                        </div>
                        {/* More product items can be added here */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
