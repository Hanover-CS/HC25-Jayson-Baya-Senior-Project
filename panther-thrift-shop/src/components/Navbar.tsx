/**
 * NavBar.tsx
 *
 * This file defines the `NavBar` component for the Panther Thrift Shop web application.
 * The `NavBar` component is a simple navigation bar that includes the application logo/title
 * and provides navigation links for the Login and Sign Up pages. It uses Next.js `Link` for
 * client-side navigation, ensuring fast transitions between pages.
 *
 * Key Features:
 * - Displays the application title with a styled logo.
 * - Provides navigation links to the Login and Sign Up pages using Next.js `Link` component.
 * - Responsive design using Tailwind CSS.
 *
 * Dependencies:
 * - Next.js `Link` for navigation.
 * - Tailwind CSS for styling.
 *
 * Author: Jayson Baya
 * Last Updated: November 14, 2024
 **/

import React from "react";
import Link from "next/link"; // Use Next.js Link for navigation

const NavBar = () => {
    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        {/* Logo or title */}
                        <Link href="/" className="text-2xl font-bold text-gray-900">
                            <span className="bg-red-600 px-2 text-white">Panther</span>{' '}
                            Thrift Shop{' '}
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Add Login and Sign Up buttons */}
                        <Link href="/pages/Login">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                                Login
                            </button>
                        </Link>
                        <Link href="/pages/SignUp">
                            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                                Sign Up
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
