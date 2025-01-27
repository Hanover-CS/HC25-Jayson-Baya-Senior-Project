/**
 * dbHandler.ts
 *
 * This module provides a unified interface for managing data in the Panther Thrift Shop web application.
 * It supports both Firebase Firestore and a local SQLite-like database (using IndexedDB via the `idb` library).
 * By toggling the `useFirestore` environment variable, the application can seamlessly switch between these
 * two database solutions.
 *
 * Features:
 * - CRUD (Create, Read, Update, Delete) operations for various data types such as `Product`, `User`, `Conversation`, and `Message`.
 * - TypeScript support with strong typings for all data types and operations.
 * - Filter support for querying data in both Firestore and IndexedDB.
 * - Graceful fallback to a local database when Firestore is unavailable or exceeds its quota.
 *
 * Usage:
 * - Use `addData` to insert new data into the database.
 * - Use `getData` to retrieve data with optional filters.
 * - Use `updateData` to update existing records by ID.
 * - Use `deleteData` to delete records by ID.
 *
 * Key Features:
 * - Abstracted operations for both Firestore and IndexedDB.
 * - Strong TypeScript typings ensure data integrity.
 * - Environment-based toggling for database usage.
 *
 * Environment Variable:
 * - `NEXT_PUBLIC_USE_FIRESTORE`: Set to `"true"` to use Firestore; otherwise, the local IndexedDB database is used.
 *
 * Data Types:
 * - `Product`: Represents a product listing in the application.
 * - `User`: Represents a user in the application.
 * - `Conversation`: Represents a chat conversation.
 * - `Message`: Represents a message within a chat conversation.
 *
 * Example:
 * ```typescript
 * // Add a new product
 * await addData<Product>("products", {
 *   id: "product123",
 *   name: "Laptop",
 *   price: 1000,
 *   category: "Electronics",
 *   description: "A high-end gaming laptop.",
 *   imageURL: "https://example.com/laptop.jpg",
 *   seller: "seller123",
 * });
 *
 * // Fetch products in the "Electronics" category
 * const products = await getData<Product>("products", [
 *   { field: "category", operator: "==", value: "Electronics" },
 * ]);
 * console.log(products);
 *
 * // Update product price
 * await updateData<Product>("products", "product123", { price: 900 });
 *
 * // Delete a product
 * await deleteData("products", "product123");
 * ```
 *
 * Author: Jayson Baya
 * Last Updated: January 25, 2025
 *
 * Dependencies:
 * - `idb`: Provides a wrapper for IndexedDB.
 * - `firebase/firestore`: Enables Firestore operations.
 *
 * Functions:
 * - `addData<T>`: Adds a new record to the database.
 * - `getData<T>`: Fetches records from the database with optional filters.
 * - `updateData<T>`: Updates an existing record in the database by ID.
 * - `deleteData`: Deletes a record from the database by ID.
 *
 * Limitations:
 * - Firestore usage is subject to quota limitations in the free tier.
 * - IndexedDB is only accessible in the browser and cannot be used in server-side code.
 *
 */


import { openDB, IDBPDatabase } from "idb";
import { db as firestoreDB } from "@/lib/firebaseConfig";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    deleteDoc,
    DocumentData,
    Query,
    CollectionReference,
} from "firebase/firestore";

interface Product {
    id: string;
    productName: string;
    price: number;
    category: string;
    description: string;
    imageURL: string;
    seller: string;
    sold?: boolean;
    createdAt: string;
}

interface User {
    uid: string;
    email: string;
    role: string;
    createdAt: string;
}

interface Conversation {
    id: string;
    participants: string[];
    lastMessage: string;
}

interface Message {
    id: string;
    conversationId: string;
    text: string;
    sender: string;
    timestamp: string;
}

const useFirestore = process.env.NEXT_PUBLIC_USE_FIRESTORE === "true";

let sqliteDB: IDBPDatabase | null = null;

const initializeDB = async (): Promise<IDBPDatabase> => {
    if (!sqliteDB) {
        sqliteDB = await openDB("PantherThriftShop", 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("products")) {
                    db.createObjectStore("products", { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains("users")) {
                    db.createObjectStore("users", { keyPath: "uid" });
                }
                if (!db.objectStoreNames.contains("conversations")) {
                    db.createObjectStore("conversations", { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains("messages")) {
                    db.createObjectStore("messages", { keyPath: "id" });
                }
            },
        });
    }
    return sqliteDB;
};

const addData = async <T extends Product | User | Conversation | Message>(
    storeName: string,
    data: T
): Promise<void> => {
    if (useFirestore) {
        const collectionRef = collection(firestoreDB, storeName);
        await addDoc(collectionRef, data);
    } else {
        const db = await initializeDB();
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        await store.add(data);
        await tx.done;
    }
};

const getData = async <T>(
    storeName: string,
    filters: { field: string; value: string | number | boolean | string[]; operator: string }[] = []
): Promise<T[]> => {
    if (useFirestore) {
        let q: Query<DocumentData> | CollectionReference<DocumentData> = collection(
            firestoreDB,
            storeName
        );
        filters.forEach((filter) => {
            q = query(q, where(filter.field, filter.operator as any, filter.value));
        });

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
    } else {
        const db = await initializeDB();
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const allData: T[] = await store.getAll();
        return filters.length
            ? allData.filter((item) =>
                filters.every(
                    (filter) =>
                        item[filter.field as keyof T] === filter.value ||
                        (Array.isArray(item[filter.field as keyof T]) &&
                            (item[filter.field as keyof T] as unknown[]).includes(filter.value))
                )
            )
            : allData;
    }
};

const updateData = async <T>(
    storeName: string,
    id: string,
    updates: Partial<T>
): Promise<void> => {
    if (useFirestore) {
        const docRef = doc(firestoreDB, storeName, id);
        await updateDoc(docRef, updates);
    } else {
        const db = await initializeDB();
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        const existingData = await store.get(id);
        if (!existingData) {
            throw new Error(`No record found with id: ${id}`);
        }
        const updatedData = { ...existingData, ...updates };
        await store.put(updatedData);
        await tx.done;
    }
};

const deleteData = async (storeName: string, id: string): Promise<void> => {
    if (useFirestore) {
        const docRef = doc(firestoreDB, storeName, id);
        await deleteDoc(docRef);
    } else {
        const db = await initializeDB();
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        await store.delete(id);
        await tx.done;
    }
};

export { addData, getData, updateData, deleteData };
