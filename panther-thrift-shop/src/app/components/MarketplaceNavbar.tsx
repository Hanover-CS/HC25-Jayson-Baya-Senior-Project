"use client"
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const MarketplaceNavBar = () => {
    const [userEmail, setUserEmail] = useState("");
    const router = useRouter();
    const [isDropdownOpen, setDropdownOpen] = useState(false);

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
                        onClick={() => window.location.reload()}
                        className="text-2xl font-bold text-gray-900">
                        <span className="bg-red-600 px-2 text-white">Panther</span>{' '}
                        Thrift Shop{' '}
                    </button>

                    {/* User Email and Account Settings */}
                    <div className="relative">
                        <span className="mr-4 text-gray-700">{userEmail}</span>
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

