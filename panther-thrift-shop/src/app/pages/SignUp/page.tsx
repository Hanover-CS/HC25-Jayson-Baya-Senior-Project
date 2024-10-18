"use client"; // Ensure this is a client-side component

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig"; // Import Firebase Auth and Firestore
import { doc, setDoc } from "firebase/firestore"; // Firestore methods

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(""); // To store success or error messages

    const handleSignUp = async () => {
        // Email validation for "@hanover.edu"
        const emailRegex = /^[a-zA-Z0-9._%+-]+@hanover\.edu$/;
        if (!emailRegex.test(email)) {
            setMessage("Email must be a valid @hanover.edu address.");
            return;
        }

        try {
            // Try to create the user with the provided email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store additional user information in Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: "customer", // Set a default role for now
                createdAt: new Date(),
            });

            console.log("Registered!");
            setMessage("You successfully registered!"); // Show success message

        } catch (error: any) {
            // Check if the error is due to an already registered email
            if (error.code === "auth/email-already-in-use") {
                setMessage("Email ID already registered.");
            } else {
                setMessage("Error registering user: " + error.message);
            }
        }
    };

    return (
        <div>
            <h1>Sign Up</h1>
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
            <button onClick={handleSignUp}>Sign Up</button>
            {message && <p style={{ color: 'red' }}>{message}</p>}
        </div>
    );
};

export default SignUp;
