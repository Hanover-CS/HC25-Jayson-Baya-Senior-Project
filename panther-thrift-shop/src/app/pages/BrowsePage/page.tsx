"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {onAuthStateChanged, User} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { Product } from "@/Models/Product";
import { FIRESTORE_COLLECTIONS, FIRESTORE_FIELDS, ROUTES } from "@/Models/ConstantData";
import { fetchRealTimeData, saveProduct } from "@/utils/firestoreUtils"; // Utility functions
import ProductGrid from "@/components/ProductGrid";
import ProductModal from "@/Models/ProductModal"; // Modal for product details

const BrowsePage = () => {
    const [userEmail, setUserEmail] = useState<string>("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showProductModal, setShowProductModal] = useState<boolean>(false);
    const router = useRouter();


    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
            if (user) {
                setUserEmail(user.email || "");
                fetchProducts(); // Fetch products when authenticated
            } else {
                router.push(ROUTES.LOGIN); // Redirect to login if not authenticated
            }
        });

        return () => unsubscribeAuth(); // Cleanup on unmount
    }, [router]);


    // Fetch products from Firestore
    const fetchProducts = () => {
        fetchRealTimeData(
            FIRESTORE_COLLECTIONS.PRODUCTS,
            [{ field: FIRESTORE_FIELDS.SOLD, operator: "==", value: false }],
            (fetchedProducts) => {
                setProducts(fetchedProducts);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching products:", error);
                setError("Error fetching products. Please try again later.");
                setLoading(false);
            }
        );
    };

    // Handle saving a product
    const handleSaveProduct = async (product: Product) => {
        try {
            const productData = {
                [FIRESTORE_FIELDS.BUYER_EMAIL]: userEmail,
                [FIRESTORE_FIELDS.PRODUCT_ID]: product.id,
                [FIRESTORE_FIELDS.PRODUCT_NAME]: product.productName,
                [FIRESTORE_FIELDS.PRICE]: product.price,
                [FIRESTORE_FIELDS.IMAGE_URL]: product.imageURL,
                [FIRESTORE_FIELDS.DESCRIPTION]: product.description,
                [FIRESTORE_FIELDS.CATEGORY]: product.category,
                [FIRESTORE_FIELDS.SELLER]: product.seller,
            };

            await saveProduct(FIRESTORE_COLLECTIONS.SAVED_ITEMS, productData);
            alert("Item saved successfully!");
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Error saving item. Please try again.");
        }
    };

    // Handle product click to open modal
    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
    };

    // Redirect to seller's page
    const handleSellerRedirect = () => {
        router.push(ROUTES.SELLERS_PAGE);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex flex-grow">
                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-4">Browse All Products</h1>

                    {loading ? (
                        <p>Loading products...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <ProductGrid
                            products={products}
                            onProductClick={handleProductClick}
                            onSaveProduct={handleSaveProduct}
                            onSellerRedirect={handleSellerRedirect}
                            userEmail={userEmail}
                            emptyMessage="No products available to browse."
                        />
                    )}
                </div>

                {/* Product Details Modal */}
                {showProductModal && selectedProduct && (
                    <ProductModal
                        product={selectedProduct}
                        isOpen={showProductModal}
                        onClose={() => setShowProductModal(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default BrowsePage;
