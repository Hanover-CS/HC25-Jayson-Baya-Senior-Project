/**
 * SignUp.tsx
 *
 * This file defines the `SignUp` component for the Panther Thrift Shop web application.
 * The `SignUp` page allows new users to register using Firebase Authentication. Users are
 * required to use a valid Hanover College email address (ending with @hanover.edu) to sign up.
 * Upon successful registration, the user's information is stored in Firestore, and they are
 * redirected to the homepage (Browse Page). Future enhancements include email verification
 * to ensure affiliation with Hanover College.
 *
 * Key Features:
 * - User registration with email and password using Firebase Authentication.
 * - Email validation to allow only @hanover.edu domain addresses.
 * - Error handling for existing user accounts and Firestore permission issues.
 * - Stores user information in Firestore with default role as "customer".
 * - Redirects to the Browse Page upon successful sign up.
 * - Responsive design using Tailwind CSS.
 *
 * Dependencies:
 * - Firebase Auth for user authentication.
 * - Firebase Firestore for storing user data.
 * - `NavBar` component for navigation.
 * - Next.js `useRouter` for client-side navigation.
 *
 * Author: Jayson Baya
 * Last Updated: November 14, 2024
 */

"use client";

import React from "react";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {FirebaseError} from "@firebase/app";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSignUp = async () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@hanover\.edu$/;
        if (!emailRegex.test(email)) {
            setMessage("Email must be a valid @hanover.edu address.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: "customer",
                createdAt: new Date(),
            });

            setMessage("You successfully registered!");

            // Redirect to Marketplace after successful sign up
            router.push("/pages/BrowsePage");
        } catch (error: unknown) {
            // Use FirebaseError for checking
            if (error instanceof FirebaseError) {
                if (error.code === "auth/email-already-in-use") {
                    setMessage("Email ID already registered.");
                } else if (error.code === "permission-denied") {
                    setMessage("Permission denied. Please check Firestore rules.");
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
