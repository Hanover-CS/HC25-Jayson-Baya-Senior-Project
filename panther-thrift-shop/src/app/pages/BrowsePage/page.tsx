"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import MarketplaceNavBar from "@/app/components/MarketplaceNavbar";
import MarketplaceSidebar from "@/app/components/MarketplaceSidebar";

// Define the structure of a Product document
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
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(""); // Error state
    const [selectedCategory, setSelectedCategory] = useState("Browse All");
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
                fetchAllProducts(); // Fetch all products
            } else {
                router.push("/pages/Login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Fetch all products from Firestore
    const fetchAllProducts = async () => {
        try {
            setLoading(true); // Set loading to true
            const productsQuery = collection(db, "products");
            const querySnapshot = await getDocs(productsQuery);
            const productList: Product[] = querySnapshot.docs.map((doc) => doc.data() as Product);
            setProducts(productList);
            setLoading(false); // Set loading to false after data is fetched
        } catch (error) {
            setError("Error fetching products. Please try again later.");
            setLoading(false);
        }
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
                                    <div key={index} className="bg-white p-4 shadow rounded">
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
                </div>
            </div>
        </div>
    );
};

export default BrowsePage;
