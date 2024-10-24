"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import MarketplaceNavBar from '@/app/components/MarketplaceNavbar';
import MarketplaceSidebar from '@/app/components/MarketplaceSidebar';

interface Product {
    productName: string;
    price: number;
    category: string;
    imageURL: string;
    description: string;
    seller: string;
}

const BrowsePage = () => {
    const [userEmail, setUserEmail] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // For the selected product
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Browse All");
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
                fetchAllProducts();
            } else {
                router.push("/pages/Login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchAllProducts = async () => {
        try {
            setLoading(true);
            const productsQuery = collection(db, "products");
            const querySnapshot = await getDocs(productsQuery);
            const productList: Product[] = querySnapshot.docs.map((doc) => doc.data() as Product);
            setProducts(productList);
            setLoading(false);
        } catch (error) {
            setError("Error fetching products. Please try again later.");
            setLoading(false);
        }
    };

    // Open the product detail modal
    const openProductModal = (product: Product) => {
        setSelectedProduct(product);
    };

    // Close the modal
    const closeProductModal = () => {
        setSelectedProduct(null);
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
                                products.map((product, index) => (
                                    <div
                                        key={index}
                                        onClick={() => openProductModal(product)} // Make product clickable
                                        className="bg-white p-4 shadow rounded cursor-pointer"
                                    >
                                        <img
                                            src={product.imageURL}
                                            alt={product.productName}
                                            className="w-full h-48 object-cover mb-4"
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

                    {/* Product detail modal */}
                    {selectedProduct && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
                                <h2 className="text-2xl font-bold mb-4">{selectedProduct.productName}</h2>
                                <img src={selectedProduct.imageURL} alt={selectedProduct.productName} className="w-full h-64 object-cover mb-4" />
                                <p className="text-gray-600">Price: ${selectedProduct.price}</p>
                                <p className="text-gray-500">Category: {selectedProduct.category}</p>
                                <p className="text-gray-500 mb-4">{selectedProduct.description}</p>
                                <p className="text-gray-500">Seller: {selectedProduct.seller}</p>
                                <button onClick={closeProductModal} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrowsePage;
