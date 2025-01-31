/**
 * SellerPage.tsx
 *
 * This file defines the `SellerPage` component for the Panther Thrift Shop web application.
 * The `SellerPage` allows users with a seller role to upload and manage their own product listings.
 * Sellers can create new listings, edit existing listings, and update the status of their products
 * (e.g., mark as sold). The component includes real-time interaction with Firebase Firestore and
 * Firebase Storage for image uploads.
 *
 * Key Features:
 * - Allows sellers to create new product listings with image upload.
 * - Real-time display of the seller's own product listings.
 * - Modal for editing product information, including product details and sold status.
 * - Responsive design using Tailwind CSS.
 *
 * Dependencies:
 * - Firebase Auth for user authentication.
 * - Firebase Firestore for real-time product data management.
 * - Firebase Storage for uploading product images.
 * - `MarketplaceNavBar` and `MarketplaceSidebar` components for navigation.
 * - `Modal` component for editing product details.
 *
 * Author: Jayson Baya
 * Last Updated: November 14, 2024
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, storage } from "@/lib/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {addData, initializeDB, updateData} from "@/lib/dbHandler"; // Import dbHandler functions
import {
    FIRESTORE_COLLECTIONS,
    FIRESTORE_FIELDS,
    ROUTES,
} from "@/Models/ConstantData";
import CreateListingForm from "@/components/SellerPageComponent/CreateNewListing";
import ProductListings from "@/components/SellerPageComponent/ProductListings";
import EditProductModal from "@/components/SellerPageComponent/EditProductModal";
import PopupAlert from "@/components/SellerPageComponent/PopupAlert";
import {uuidv4} from "@firebase/util";
import {collection, getDocs, query, where} from "firebase/firestore";
import { db as firestoreDB } from "@/lib/firebaseConfig";



console.log("CreateListingForm:", CreateListingForm);
console.log("ProductListings:", ProductListings);
console.log("EditProductModal:", EditProductModal);
console.log("PopupAlert:", PopupAlert);

interface Product extends Record<string, unknown>{
    buyerEmail: string;
    purchaseDate: string;
    id: string;
    productName: string;
    price: number;
    category: string;
    imageURL: string;
    description: string;
    seller: string;
    sold: boolean;
    createdAt: string;
}

const SellerPage = () => {
    const [userEmail, setUserEmail] = useState("");
    const [productName, setProductName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
                fetchSellerProducts(user.email);
            } else {
                router.push(ROUTES.LOGIN);
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Fetch seller's product listings
    const fetchSellerProducts = async (email: string | null) => {
        if (!email) return;
        try {
            const db = await initializeDB();
            const tx = db.transaction(FIRESTORE_COLLECTIONS.PRODUCTS, "readonly");
            const store = tx.objectStore(FIRESTORE_COLLECTIONS.PRODUCTS);
            const localProducts = await store.getAll();

            // 🔹 Filter Local IndexedDB Products by Seller Email
            const sellerLocalProducts = localProducts.filter(product => product.seller === email);

            if (sellerLocalProducts.length > 0) {
                console.log("Loading seller's products from IndexedDB:", sellerLocalProducts);
                setProducts(sellerLocalProducts);
            } else {
                console.log("Fetching seller's products from Firestore...");
                const snapshot = await getDocs(query(
                    collection(firestoreDB, FIRESTORE_COLLECTIONS.PRODUCTS),
                    where(FIRESTORE_FIELDS.SELLER, "==", email)  // Ensure seller email matches
                ));

                const firestoreProducts = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })) as Product[];

                setProducts(firestoreProducts);

                // 🔹 Save Only Seller's Products to IndexedDB
                const txWrite = db.transaction(FIRESTORE_COLLECTIONS.PRODUCTS, "readwrite");
                const storeWrite = txWrite.objectStore(FIRESTORE_COLLECTIONS.PRODUCTS);
                for (const product of firestoreProducts) {
                    await storeWrite.put(product);
                }
                await txWrite.done;
            }
        } catch (error) {
            console.error("Error fetching seller's products:", error);
        }
    };



    // Handle form submission for creating a new listing
    const handleCreateListing = async () => {
        if (!productName || !category || !image || !price || !description) {
            setMessage("All fields are required!");
            setShowPopup(true);
            return;
        }

        const storageRef = ref(storage, `products/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
            "state_changed",
            () => {},
            (error) => {
                setMessage(`Error uploading image: ${error.message}`);
                setShowPopup(true);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const newProduct: Product = {
                    buyerEmail: "",
                    id: uuidv4(),
                    productName,
                    category,
                    price,
                    description,
                    imageURL: downloadURL,
                    seller: userEmail,
                    sold: false,
                    createdAt: new Date().toISOString(),
                    purchaseDate: new Date().toISOString()
                };

                try {
                    if (navigator.onLine) {
                        await addData(FIRESTORE_COLLECTIONS.PRODUCTS, newProduct); // Save to Firestore
                    } else {
                        console.warn("Offline mode: Saving product locally.");
                        const db = await initializeDB();
                        const tx = db.transaction(FIRESTORE_COLLECTIONS.PRODUCTS, "readwrite");
                        const store = tx.objectStore(FIRESTORE_COLLECTIONS.PRODUCTS);
                        await store.add(newProduct);
                        await tx.done;
                    }
                    // Reset form
                    setProductName("");
                    setCategory("");
                    setPrice(0);
                    setDescription("");
                    setImage(null);

                    // Refresh listings
                    await fetchSellerProducts(userEmail);
                } catch (error) {
                    setMessage(`Error listing product: ${(error as Error).message}`);
                    setShowPopup(true);
                }
            }
        );
    };


    // Handle product click for editing
    const handleEditProduct = (product: Product) => {
        if (product.seller !== userEmail) {
            setMessage("You can only edit your own listings.");
            setShowPopup(true);
            return;
        }
        setSelectedProduct(product);
        setShowEditModal(true);
    };


    // Handle updating the product
    const handleUpdateProduct = async () => {
        if (!selectedProduct) return;

        try {
            if (selectedProduct.sold && !selectedProduct.buyerEmail) {
                setMessage("Buyer email is required when marking an item as sold.");
                setShowPopup(true);
                return;
            }

            const updatedProduct = {
                productName: selectedProduct.productName,
                category: selectedProduct.category,
                price: selectedProduct.price,
                description: selectedProduct.description,
                sold: selectedProduct.sold,
                buyerEmail: selectedProduct.buyerEmail || null,
            };

            await updateData(
                FIRESTORE_COLLECTIONS.PRODUCTS,
                selectedProduct.id,
                updatedProduct
            );

            // If product is sold, move it to Purchased Orders
            if (selectedProduct.sold && selectedProduct.buyerEmail) {
                const purchasedItem = {
                    productName: selectedProduct.productName,
                    category: selectedProduct.category,
                    price: selectedProduct.price,
                    description: selectedProduct.description,
                    imageURL: selectedProduct.imageURL,
                    seller: selectedProduct.seller,
                    sold: true, // Mark as sold
                    buyerEmail: selectedProduct.buyerEmail,
                    createdAt: selectedProduct.createdAt, // Keep original timestamp
                    purchaseDate: new Date().toISOString(), // Add new timestamp
                };

                await addData(FIRESTORE_COLLECTIONS.PURCHASED_ITEMS, purchasedItem);

                console.log("Item successfully added to PURCHASED_ITEMS");
            }

            setMessage("Product updated successfully!");
            setShowPopup(true);
            setSelectedProduct(null);
            setShowEditModal(false);

            // Refresh Listings
            await fetchSellerProducts(userEmail);
        } catch (error) {
            setMessage("Error updating product: " + (error as Error).message);
            setShowPopup(true);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex flex-grow">
                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-6">My Listings</h1>

                    {/* Create New Listing */}
                    <CreateListingForm
                        name={productName}
                        setName={setProductName}
                        category={category}
                        setCategory={setCategory}
                        price={price}
                        setPrice={setPrice}
                        description={description}
                        setDescription={setDescription}
                        setImage={setImage}
                        handleCreateListing={handleCreateListing}
                    />

                    {/* Existing Listings */}
                    <ProductListings
                        products={products}
                        handleEditProduct={handleEditProduct}
                    />

                    {/* Popup for success or error messages */}
                    {showPopup && (
                        <PopupAlert
                            message={message}
                            onClose={() => setShowPopup(false)}
                        />
                    )}

                    {/* Edit Product Modal */}
                    {selectedProduct && showEditModal && (
                        <EditProductModal
                            selectedProduct={selectedProduct}
                            setSelectedProduct={setSelectedProduct}
                            setShowEditModal={setShowEditModal}
                            handleUpdateProduct={handleUpdateProduct}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerPage;
