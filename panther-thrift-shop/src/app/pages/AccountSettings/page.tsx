/**
 * AccountSettings.tsx
 *
 * This file defines the `AccountSettings` component for the Panther Thrift Shop web application.
 * The `AccountSettings` page allows authenticated users to view their email and update their password.
 * It includes Firebase authentication integration for fetching the current user and updating the password
 * with reauthentication. If the user is not logged in, they are redirected to the login page.
 *
 * Key Features:
 * - Displays the user's email (read-only) and provides an option to update the password.
 * - Uses Firebase authentication for reauthentication and password updates.
 * - Includes client-side form validation and error handling.
 * - Responsive design using Tailwind CSS.
 *
 * Dependencies:
 * - Firebase Auth for user authentication.
 * - `MarketplaceNavBar` component for navigation.
 * - Next.js `useRouter` for client-side navigation.
 *
 * Author: Jayson Baya
 * Last Updated: November 14, 2024
 */

"use client";
import React from "react";
import { useState, useEffect } from "react";
import {reauthenticateWithCredential, EmailAuthProvider, updatePassword, onAuthStateChanged, User} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import MarketplaceNavBar from "@/components/MarketplaceNavbar";

const AccountSettings = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null); // Holds the current authenticated user
    const [showPasswordFields, setShowPasswordFields] = useState(false); // Toggles the visibility of the password fields
    const [prevPassword, setPrevPassword] = useState(""); // Stores the previous password
    const [newPassword, setNewPassword] = useState(""); // Stores the new password
    const [confirmPassword, setConfirmPassword] = useState(""); // Confirms the new password
    const [message, setMessage] = useState(""); // Displays messages for success/error
    const router = useRouter();

    // Fetch the currently authenticated user
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                // Redirect to Login if not authenticated
                router.push("/pages/Login");
            }
        });
        return () => unsubscribe();
    }, [router]);

    // Handle showing password fields
    const handleShowPasswordFields = () => {
        setShowPasswordFields(true);
    };

    // Handle password update
    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage("New passwords do not match.");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(currentUser!.email!, prevPassword);
            // Re-authenticate the user with the previous password
            await reauthenticateWithCredential(currentUser!, credential);

            // Update the user's password
            await updatePassword(currentUser!, newPassword);
            setMessage("Password updated successfully!");
            setPrevPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordFields(false); // Hide the password fields after success
        } catch (error: unknown) {
            setMessage("Error updating password: " + (error as Error).message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Include Navbar */}
            <MarketplaceNavBar />
            <div className="flex flex-grow justify-center items-center">
                <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center mb-6">Account Settings</h1>

                    {/* Display email (disabled, cannot be changed) */}
                    <div className="mb-6">
                        <label className="block mb-2 text-gray-700">Email</label>
                        <input
                            type="email"
                            value={currentUser?.email || ""}
                            disabled
                            className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                        />
                    </div>

                    {/* Update Password */}
                    <div className="mb-6">
                        <button
                            onClick={handleShowPasswordFields}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                        >
                            Update Password
                        </button>
                    </div>

                    {/* Show password fields if 'Update Password' is clicked */}
                    {showPasswordFields && (
                        <div className="mb-6">
                            <label className="block mb-2 text-gray-700">Previous Password</label>
                            <input
                                type="password"
                                value={prevPassword}
                                onChange={(e) => setPrevPassword(e.target.value)}
                                placeholder="Previous Password"
                                className="w-full p-2 border rounded mb-4"
                            />

                            <label className="block mb-2 text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                className="w-full p-2 border rounded mb-4"
                            />

                            <label className="block mb-2 text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm New Password"
                                className="w-full p-2 border rounded mb-4"
                            />

                            <button
                                onClick={handleUpdatePassword}
                                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                            >
                                Submit New Password
                            </button>
                        </div>
                    )}

                    {/* Display messages */}
                    {message && (
                        <p className={`text-center ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
