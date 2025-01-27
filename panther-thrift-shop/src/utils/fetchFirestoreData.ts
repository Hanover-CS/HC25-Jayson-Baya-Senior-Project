
/**
 * Fetches data from Firestore with optional filtering conditions.
 *
 * @template T - The expected data type (e.g., `Product`, `User`, etc.).
 * @param collectionName - Name of the Firestore collection to query.
 * @param filters - Array of filtering conditions (optional).
 * @returns A promise resolving to a list of documents of type `T`.
 *
 * @example
 * const products = await fetchFirestoreData<Product>("products", [
 *   { field: "category", operator: "==", value: "Electronics" },
 *   { field: "price", operator: ">", value: 100 },
 * ]);
 */

import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, query, where, QueryConstraint } from "firebase/firestore";
import firebase from "firebase/compat/app";
import WhereFilterOp = firebase.firestore.WhereFilterOp;

export const fetchFirestoreData = async <T>(
    collectionName: string, userEmail: string, BUYER_EMAIL: string, filters: {
        field: string;
        value: string;
        operator: string
    }[]): Promise<T[]> => {
    try {
        // Build Firestore query with optional filters
        const constraints: QueryConstraint[] = filters.map((filter) =>
            where(filter.field as string, <WhereFilterOp>filter.operator, filter.value)
        );
        const dataQuery = query(collection(db, collectionName), ...constraints);

        // Execute query and transform snapshot into typed data
        const querySnapshot = await getDocs(dataQuery);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        } as T));
    } catch (error) {
        console.error(`Error fetching data from ${collectionName}:`, error);
        return [];
    }
};
