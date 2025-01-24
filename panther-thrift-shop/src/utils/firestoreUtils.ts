import { db } from "@/lib/firebaseConfig";
import {
    collection,
    query,
    where,
    addDoc,
    onSnapshot,
    FirestoreError,
    getDocs,
    doc,
    setDoc,
    deleteDoc
} from "firebase/firestore";
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
    productData: Record<string, unknown>
): Promise<void> => {
    // Use `setDoc` with a specific product ID to ensure only one instance per user per product
    const docRef = doc(collection(db, collectionName), productData.productId as string);
    await setDoc(docRef, productData);
};

/**
 * Removes a saved product from Firestore.
 */
export const unsaveProduct = async (collectionName: string, productId: string): Promise<void> => {
    const docRef = doc(collection(db, collectionName), productId);
    await deleteDoc(docRef);
};

/**
 * Checks if a product is already saved in Firestore by the current user.
 */
export const isProductSaved = async (
    collectionName: string,
    userEmail: string,
    productId: string
): Promise<boolean> => {
    const q = query(
        collection(db, collectionName),
        where("buyerEmail", "==", userEmail),
        where("productId", "==", productId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
};