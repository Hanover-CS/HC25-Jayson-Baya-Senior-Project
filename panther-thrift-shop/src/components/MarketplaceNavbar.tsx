/**
 * MarketplaceNavBar.tsx
 *
 * This file defines the `MarketplaceNavBar` component for the Panther Thrift Shop web application.
 * The `MarketplaceNavBar` serves as the navigation bar for the marketplace pages. It displays the
 * application title, the logged-in user's email, and provides buttons for navigating to account
 * settings and logging out. The component listens to the authentication state and redirects users
 * to the login page if they are not authenticated.
 *
 * Key Features:
 * - Displays the application title and user email.
 * - Provides navigation buttons for account settings and logout.
 * - Listens to Firebase authentication state changes for user session management.
 * - Redirects unauthenticated users to the login page.
 * - Responsive design using Tailwind CSS.
 *
 * Dependencies:
 * - Firebase Auth for user session management.
 * - Next.js `useRouter` for client-side navigation.
 *
 * Author: Jayson Baya
 * Last Updated: November 14, 2024
 */

"use client"
import React from "react";
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const MarketplaceNavBar = () => {
    const [userEmail, setUserEmail] = useState("");
    const router = useRouter();

    // Listen to the authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || ""); // Set the email when user is authenticated
            } else {
                router.push('/pages/Login'); // If no user, redirect to login
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/pages/Login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Title: Panther Thrift Shop */}
                    <button
                        onClick={() => router.push('/pages/BrowsePage')}
                        className="text-2xl font-bold text-gray-900">
                        <span className="bg-red-600 px-2 text-white">Panther</span>{' '}
                        Thrift Shop{' '}
                    </button>

                    {/* User Email, Account Settings, and Logout */}
                    <div className="flex items-center space-x-4">
                        <span> Login in as: {" "}
                            <span className="text-gray-700">{userEmail}</span>
                        </span>
                        <button
                            onClick={() => router.push('/pages/AccountSettings')}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                            Account Settings
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default MarketplaceNavBar;

