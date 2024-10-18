"use client"; // Add this at the top to make this a client-side component

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig"; // Import Firebase Auth

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(""); // To store success messages

    const handleLogin = async () => {
        try {
            // Attempt to log in the user
            await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in!");

            // Update the UI with a success message
            setSuccess("User successfully logged in!");
            setError(""); // Clear any previous errors if the login is successful
        } catch (error: any) {
            setError("User is not registered!"); // Display the error message
            setSuccess(""); // Clear any previous success messages
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button onClick={handleLogin}>Login</button>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Show error in red */}
            {success && <p style={{ color: 'green' }}>{success}</p>} {/* Show success in green */}
        </div>
    );
};

export default Login;
