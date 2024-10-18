"use client"
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth'; // Import signOut function from Firebase Auth
import { auth } from '@/lib/firebaseConfig'; // Import Firebase Auth instance
import { useState } from 'react';

const MarketplaceNavBar = () => {
    const router = useRouter();
    const [isDropdownOpen, setDropdownOpen] = useState(false); // Toggle dropdown state

    // Handle logout function
    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/'); // Redirect to login page after logout
        } catch (error) {
            console.error('Error logging out: ', error);
        }
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Title: Panther Thrift Shop */}
                    <button
                        onClick={() => window.location.reload()}
                        className="text-2xl font-bold text-gray-900">
                        Panther Thrift Shop
                    </button>

                    {/* Account Settings and Logout */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!isDropdownOpen)}
                            className="text-gray-900 focus:outline-none">
                            Account
                        </button>

                        {/* Dropdown menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2">
                                <button
                                    onClick={() => router.push('/account-settings')}
                                    className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                                    Account Settings
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default MarketplaceNavBar;

