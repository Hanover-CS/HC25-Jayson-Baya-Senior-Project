//  Users can log in to the application (including Firebase Authentication).
"use client";
import React from "react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "@/components/Navbar";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setSuccess("User successfully logged in!");
            setError("");
            // Redirect to Marketplace after successful login
            router.push("/pages/BrowsePage");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError("User is not registered!");
            } else {
                setError("An unexpected error occurred.");
            }
            setSuccess("");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <NavBar />
            <div className="flex flex-grow justify-center items-center">
                <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                    <h1 className="text-4xl font-bold text-center mb-4">
                        <span className="text-red-600">Panther</span> Thrift Shop
                    </h1>
                    <p className="text-center text-lg mb-6">Log in to continue</p>
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
                            onClick={handleLogin}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                        >
                            Log In
                        </button>
                        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
                        {success && <p className="text-green-600 mt-4 text-center">{success}</p>}
                    </div>
                    <p className="text-center mt-6">
                        Don&apos;t have an account?{" "}
                        <Link href="/pages/SignUp" className="text-blue-600 hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
