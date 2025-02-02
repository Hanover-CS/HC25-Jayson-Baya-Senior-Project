/**
 * SignUp.tsx
 *
 * This file defines the SignUp component for the Panther Thrift Shop web application.
 * The SignUp page enables new users to create an account using Firebase Authentication.
 * Users must register using a valid Hanover College email address (ending with @hanover.edu).
 * Upon successful registration, the user's information is stored either in Firebase Firestore
 * (if enabled via environment configuration) or in IndexedDB as a fallback, and the user is
 * redirected to the Browse Page.
 *
 * Future enhancements may include adding email verification to confirm Hanover College affiliation.
 *
 * Key Features:
 * - User registration with email and password via Firebase Authentication.
 * - Email validation to ensure only @hanover.edu addresses are accepted.
 * - Error handling for common issues (e.g., email already in use, Firestore permission errors).
 * - Stores new user information with a default role of "customer" and a creation timestamp.
 * - Conditional storage: supports saving to Firestore or IndexedDB based on environment settings.
 * - Responsive design implemented with Tailwind CSS.
 *
 * Dependencies:
 * - Firebase Auth for user authentication.
 * - Firebase Firestore for storing user data when enabled.
 * - IndexedDB (via the custom addData function) for offline data storage as a fallback.
 * - Next.js useRouter for client-side navigation.
 * - Next.js Link component for navigation between SignUp and Login pages.
 *
 * Author: Jayson Baya
 * Last Updated: February 2, 2025
 */

"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {auth, db} from "@/lib/firebaseConfig";
import { addData } from "@/lib/dbHandler";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "@firebase/app";
import {collection, doc, setDoc} from "firebase/firestore";

const SignUp = () => {
    const useFirestore = process.env.NEXT_PUBLIC_USE_FIRESTORE === "true";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSignUp = async () => {
        // Validate Hanover College email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@hanover\.edu$/;
        if (!emailRegex.test(email)) {
            setMessage("Email must be a valid @hanover.edu address.");
            return;
        }

        try {
            // Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userData = {
                uid: user.uid,
                email: user.email,
                role: "customer",
                createdAt: new Date().toISOString(),
            };

            if (useFirestore) {
                // Save to Firestore
                const usersRef = collection(db, "users");
                await setDoc(doc(usersRef, user.uid), userData);
                console.log("✅ User data saved to Firestore");
            } else {
                // Save to IndexedDB
                await addData("users", userData);
                console.log("✅ User data saved to IndexedDB");
            }


            setMessage("You successfully registered!");
            // Redirect to BrowsePage after successful sign up
            router.push("/pages/BrowsePage");
        } catch (error: unknown) {
            if (error instanceof FirebaseError) {
                // Firebase-specific error handling
                if (error.code === "auth/email-already-in-use") {
                    setMessage("Email ID already registered.");
                } else if (error.code === "permission-denied") {
                    setMessage("Permission denied. Please check database rules.");
                } else {
                    setMessage(`Error registering user: ${(error as Error).message}`);
                }
            } else {
                setMessage("An unknown error occurred.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <div className="flex flex-grow justify-center items-center">
                <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                    <h1 className="text-4xl font-bold text-center mb-4">
                        <span className="text-red-600">Panther</span> Thrift Shop
                    </h1>
                    <p className="text-center text-lg mb-6">Sign up to create an account</p>
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full p-2 border rounded mb-4"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-2 border rounded mb-4"
                        />
                        <button
                            onClick={handleSignUp}
                            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                        >
                            Sign Up
                        </button>
                        {message && <p className="text-red-600 mt-4 text-center">{message}</p>}
                    </div>
                    <p className="text-center mt-6">
                        Already have an account?{" "}
                        <Link href="/pages/Login" className="text-blue-600 hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
