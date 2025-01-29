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
import {addData, getData, updateData} from "@/lib/dbHandler"; // Import dbHandler functions
import {
    fetchProductsAlert,
    FIRESTORE_COLLECTIONS,
    FIRESTORE_FIELDS,
    ROUTES,
} from "@/Models/ConstantData";
import CreateListingForm from "@/components/SellerPageComponent/CreateNewListing";
import ProductListings from "@/components/SellerPageComponent/ProductListings";
import EditProductModal from "@/components/SellerPageComponent/EditProductModal";
import PopupAlert from "@/components/SellerPageComponent/PopupAlert";
import {uuidv4} from "@firebase/util";


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
    sold?: boolean;
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
            const fetchedProducts = await getData<Product>(FIRESTORE_COLLECTIONS.PRODUCTS, [{
                field: FIRESTORE_FIELDS.SELLER,
                operator: "==",
                value: email
            }]);
            setProducts(fetchedProducts);
        } catch (error) {
            console.error(fetchProductsAlert.Error, error);
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
                    await addData(FIRESTORE_COLLECTIONS.PRODUCTS, newProduct);
                    setMessage("Product listed successfully!");
                    setShowPopup(true);

                    // Reset form
                    setProductName("");
                    setCategory("");
                    setPrice(0);
                    setDescription("");
                    setImage(null);

                    // Refresh listings
                    fetchSellerProducts(userEmail);
                } catch (error) {
                    setMessage(`Error listing product: ${(error as Error).message}`);
                    setShowPopup(true);
                }
            }
        );
    };


    // Handle product click for editing
    const handleEditProduct = (product: Product) => {
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
