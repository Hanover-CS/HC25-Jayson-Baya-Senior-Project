// Browsing Page -- User's and buyer's homepage
"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import {collection, query, where, onSnapshot, getDocs, addDoc} from "firebase/firestore";
import MarketplaceNavBar from "@/app/components/MarketplaceNavbar";
import MarketplaceSidebar from "@/app/components/MarketplaceSidebar";
import Modal from "@/app/components/Modal"; // Modal for product details

// Define the structure of a Product document
interface Product {
    id: string;
    productName: string;
    price: number;
    category: string;
    imageURL: string;
    description: string;
    seller: string;
    sold?: boolean;
}

const BrowsePage = () => {
    const [userEmail, setUserEmail] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Browse All");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
                fetchRealTimeProducts(); // Start real-time product listener
            } else {
                router.push("/pages/Login");
            }
        });

        return () => unsubscribeAuth();
    }, [router]);

    // Set up real-time listener for available products (not marked as sold)
    const fetchRealTimeProducts = () => {
        setLoading(true);
        const productsQuery = query(collection(db, "products"), where("sold", "==", false));
        const unsubscribeProducts = onSnapshot(
            productsQuery,
            (snapshot) => {
                const productList: Product[] = snapshot.docs.map(
                    (doc) => ({ ...doc.data(), id: doc.id } as Product)
                );
                setProducts(productList);
                setLoading(false);
            },
            (error) => {
                setError("Error fetching products. Please try again later.");
                setLoading(false);
            }
        );

        return unsubscribeProducts; // Cleanup listener on component unmount
    };

    // Handle saving a product to the savedItems collection
    const handleSaveProduct = async (product: Product) => {
        try {
            const savedItemsQuery = query(
                collection(db, "savedItems"),
                where("buyerEmail", "==", userEmail),
                where("productId", "==", product.id)
            );
            const savedSnapshot = await getDocs(savedItemsQuery);

            if (savedSnapshot.empty) {
                await addDoc(collection(db, "savedItems"), {
                    buyerEmail: userEmail,
                    productId: product.id,
                    productName: product.productName,
                    price: product.price,
                    imageURL: product.imageURL,
                    description: product.description,
                    category: product.category,
                    seller: product.seller,
                });
                alert("Item saved successfully!");
            } else {
                alert("Item is already saved.");
            }
        } catch (error) {
            console.error("Error saving item:", error);
            alert("Error saving item. Please try again.");
        }
    };

    // Handle product click to open product details in modal
    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
    };

    // Redirect to seller's listing page if the user is the seller
    const handleSellerRedirect = () => {
        router.push("/pages/SellersPage");
    };

    return (
        <div className="min-h-screen flex flex-col">
            <MarketplaceNavBar />

            <div className="flex flex-grow">
                <MarketplaceSidebar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-4">Browse All Products</h1>

                    {loading ? (
                        <p>Loading products...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white p-4 shadow rounded cursor-pointer"
                                    >
                                        <img
                                            src={product.imageURL}
                                            alt={product.productName}
                                            className="w-full h-48 object-contain mb-4"
                                            onClick={() => handleProductClick(product)}
                                        />
                                        <h2 className="text-lg font-semibold">{product.productName}</h2>
                                        <p className="text-gray-600">${product.price}</p>
                                        <p className="text-gray-500">{product.description}</p>

                                        {product.seller === userEmail ? (
                                            <button
                                                onClick={handleSellerRedirect}
                                                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                                            >
                                                Listings
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSaveProduct(product)}
                                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                            >
                                                Save
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No items available yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Product Details Modal */}
            {showProductModal && selectedProduct && (
                <Modal onClose={() => setShowProductModal(false)}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">{selectedProduct.productName}</h2>
                        <img
                            src={selectedProduct.imageURL}
                            alt={selectedProduct.productName}
                            className="w-full h-48 object-contain mb-4"
                        />
                        <p className="text-gray-600 mb-2">Price: ${selectedProduct.price}</p>
                        <p className="text-gray-600 mb-2">Category: {selectedProduct.category}</p>
                        <p className="text-gray-600 mb-4">Description: {selectedProduct.description}</p>
                        <p className="text-gray-600 font-bold">Seller: {selectedProduct.seller}</p>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default BrowsePage;
