"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
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
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // To show the product details
    const [showProductModal, setShowProductModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
                fetchAvailableProducts(); // Fetch available products (excluding sold)
            } else {
                router.push("/pages/Login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Fetch products that are not sold
    const fetchAvailableProducts = async () => {
        try {
            setLoading(true);
            const productsQuery = query(collection(db, "products"), where("sold", "==", false));
            const querySnapshot = await getDocs(productsQuery);
            const productList: Product[] = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Product));
            setProducts(productList);
            setLoading(false);
        } catch (error) {
            setError("Error fetching products. Please try again later.");
            setLoading(false);
        }
    };

    // Handle product click
    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setShowProductModal(true); // Show product details in a modal
    };

    return (
        <div className="min-h-screen flex flex-col">
            <MarketplaceNavBar />

            <div className="flex flex-grow">
                {/* Sidebar */}
                <MarketplaceSidebar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

                {/* Main Content */}
                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-4">Browse All Products</h1>

                    {loading ? (
                        <p>Loading products...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.length > 0 ? (
                                products.map((product, index) => (
                                    <div
                                        key={index}
                                        className="bg-white p-4 shadow rounded cursor-pointer"
                                        onClick={() => handleProductClick(product)} // Make product clickable
                                    >
                                        <img
                                            src={product.imageURL}
                                            alt={product.productName}
                                            className="w-full h-48 object-contain mb-4"
                                        />
                                        <h2 className="text-lg font-semibold">{product.productName}</h2>
                                        <p className="text-gray-600">${product.price}</p>
                                        <p className="text-gray-500">{product.description}</p>
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
