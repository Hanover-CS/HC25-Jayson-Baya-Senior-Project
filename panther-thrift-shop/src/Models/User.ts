/**
 * User.ts
 *
 * This file defines the `User` class, which represents a user in the Panther Thrift Shop
 * application. The `User` class includes properties for the user's unique ID (uid), email,
 * role (e.g., buyer or seller), and the account creation date. The class provides methods
 * to check the user's role and update the user's role. It also includes a static method
 * to create a `User` instance from Firestore data.
 *
 * Key Features:
 * - Represents a user with relevant details such as uid, email, role, and createdAt date.
 * - Provides methods for role verification and role updates.
 * - Utility function for constructing `User` instances from Firestore data.
 *
 * Dependencies:
 * - `FirestoreUserData` interface defines the structure of user data from Firestore.
 *
 * Author: Jayson Baya
 * Last Updated: November 14, 2024
 */

export class User {
    uid: string;
    email: string;
    role: string;
    createdAt: Date;

    constructor(uid: string, email: string, role: string, createdAt: Date) {
        this.uid = uid;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
    }

    isSeller(): boolean {
        return this.role === "seller";
    }

    updateRole(newRole: string) {
        this.role = newRole;
    }

    // Define an explicit type for Firestore data
    static fromFirestoreData(uid: string, data: FirestoreUserData): User {
        return new User(
            uid,
            data.email,
            data.role,
            new Date(data.createdAt.seconds * 1000)
        );
    }
}

// Define the FirestoreUserData interface
interface FirestoreUserData {
    email: string;
    role: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
}
