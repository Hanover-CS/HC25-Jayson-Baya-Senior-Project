import { db } from "@/lib/firebaseConfig";
import { collection, query, where, addDoc, onSnapshot, FirestoreError } from "firebase/firestore";
import { Product } from "@/Models/Product";

/**
 * Fetches real-time products based on a query condition.
 */
type FirestoreOperator = "<" | "<=" | "==" | "!=" | ">=" | ">" | "array-contains" | "in";
type FirestoreValue = string | number | boolean | Array<string | number | boolean>;
export const fetchRealTimeData = (
    collectionName: string,
    queryConditions: { field: string; operator: FirestoreOperator; value: FirestoreValue }[],
    onSuccess: (products: Product[]) => void,
    onError: (error: FirestoreError) => void
) => {
    const q = query(
        collection(db, collectionName),
        ...queryConditions.map((condition) => where(condition.field, condition.operator, condition.value))
    );

    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const products: Product[] = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Product));
            onSuccess(products);
        },
        (error) => {
            onError(error);
        }
    );

    return unsubscribe;
};

/**
 * Saves a product to Firestore under a specific collection.
 */
export const saveProduct = async (
    collectionName: string,
    productData: Record<string, unknown> // Changed `any` to `unknown` for stricter typing
): Promise<void> => {
    await addDoc(collection(db, collectionName), productData);
};
