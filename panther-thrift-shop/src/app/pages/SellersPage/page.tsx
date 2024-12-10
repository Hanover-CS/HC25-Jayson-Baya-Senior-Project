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
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {fetchProductsAlert, FIRESTORE_COLLECTIONS, FIRESTORE_FIELDS, ROUTES} from "@/Models/ConstantData";
import CreateListingForm from "@/components/SellerPageComponent/CreateNewListing";
import ProductListings from "@/components/SellerPageComponent/ProductListings";
import EditProductModal from "@/components/SellerPageComponent/EditProductModal";
import PopupAlert from "@/components/SellerPageComponent/PopupAlert"; // Modal component for pop-up

interface Product {
    id: string;
    productName: string;
    price: number;
    category: string;
    imageURL: string;
    description: string;
    seller: string;
    sold?: boolean; // Sold status
}

const SellerPage = () => {
    const [userEmail, setUserEmail] = useState("");
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // For editing
    const [showEditModal, setShowEditModal] = useState(false); // State for controlling the pop-up
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

    // Fetch seller's listings from Firestore
    const fetchSellerProducts = async (userEmail: string | null) => {
        try {
            const q = query(
                collection(db, FIRESTORE_COLLECTIONS.PRODUCTS),
                where(FIRESTORE_FIELDS.SELLER, "==", userEmail)
            );
            const querySnapshot = await getDocs(q);
            const listings: Product[] = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id
            } as Product));
            setProducts(listings);
        } catch (error) {
            console.error(fetchProductsAlert.Error, error);
        }
    };


    // Handle form submission for creating a new listing
    const handleCreateListing = async () => {
        if (!name || !category || !image || !price || !description) {
            setMessage("All fields are required!");
            setShowPopup(true);
            return;
        }

        // Upload image to Firebase Storage
        const storageRef = ref(storage, `products/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
            "state_changed",
            () => {},
            (error) => {
                setMessage(fetchProductsAlert.Error + error.message);
                setShowPopup(true);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                try {
                    await addDoc(collection(db, FIRESTORE_COLLECTIONS.PRODUCTS), {
                        [FIRESTORE_FIELDS.PRODUCT_NAME]: name,
                        [FIRESTORE_FIELDS.CATEGORY]: category,
                        [FIRESTORE_FIELDS.PRICE]: price,
                        [FIRESTORE_FIELDS.DESCRIPTION]: description,
                        [FIRESTORE_FIELDS.IMAGE_URL]: downloadURL,
                        [FIRESTORE_FIELDS.SELLER]: userEmail,
                        [FIRESTORE_FIELDS.SOLD]: false,
                        [FIRESTORE_FIELDS.CREATED_AT]: new Date(),
                    });

                    setMessage("Product listed successfully!");
                    setShowPopup(true);

                    setName("");
                    setCategory("");
                    setPrice(0);
                    setDescription("");
                    setImage(null);

                    fetchSellerProducts(userEmail);
                } catch (error) {
                    setMessage(fetchProductsAlert.Error + (error as Error).message);
                    setShowPopup(true);
                }
            }
        );
    };

    // Handle product click for editing
    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product); // Set the selected product for editing
        setShowEditModal(true); // Open the modal
    };

    // Handle updating the product
    const handleUpdateProduct = async () => {
        if (selectedProduct) {
            try {
                const productRef = doc(db, "products", selectedProduct.id);
                await updateDoc(productRef, {
                    productName: selectedProduct.productName,
                    category: selectedProduct.category,
                    price: selectedProduct.price,
                    description: selectedProduct.description,
                    sold: selectedProduct.sold,
                });

                setMessage("Product updated successfully!");
                setShowPopup(true);
                setSelectedProduct(null); // Reset after update
                setShowEditModal(false); // Close the modal
                fetchSellerProducts(userEmail);
            } catch (error) {
                setMessage("Error updating product: " + (error as Error).message);
                setShowPopup(true);
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex flex-grow">

                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-6">My Listings</h1>

                    {/* Create New Listing */}
                    <CreateListingForm
                        name={name}
                        setName={setName}
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

