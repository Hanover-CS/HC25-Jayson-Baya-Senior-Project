import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Product } from "@/Models/Product";

/**
 * Fetch Firestore data for a specific collection and email condition.
 * Returns a promise resolving to a list of products.
 */
export const fetchFirestoreData = async (
    collectionName: string,
    email: string | null,
    field: string
): Promise<Product[]> => {
    try {
        const dataQuery = query(
            collection(db, collectionName),
            where(field, "==", email)
        );
        const querySnapshot = await getDocs(dataQuery);
        return querySnapshot.docs.map((doc) => doc.data() as Product);
    } catch (error) {
        console.error(`Error fetching data from ${collectionName}:`, error);
        return [];
    }
};
