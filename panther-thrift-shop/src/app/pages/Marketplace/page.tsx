"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig"; // Import Firestore
import { collection, query, where, getDocs } from "firebase/firestore";
import MarketplaceNavBar from "@/app/components/MarketplaceNavbar";
import MarketplaceSidebar from "@/app/components/MarketplaceSidebar";

interface Product {
    name: string;
    category: string;
    imageURL: string;
    description: string;
    price: number;
}

const Marketplace = () => {
    const [userEmail, setUserEmail] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Browse All");
    const [products, setProducts] = useState<Product[]>([]); // Use the Product type here
    const router = useRouter();

    const categories = [
        { name: "Men's Clothing", subcategories: ["Shirts", "Pants", "Shoes"] },
        { name: "Women's Clothing", subcategories: ["Shirts", "Pants", "Shoes"] },
        { name: "Appliances" },
        { name: "Room Decoration" },
        { name: "Textbooks" },
    ];

    const fetchProducts = async (category: string) => {
        try {
            let productQuery;
            if (category === "Browse All") {
                productQuery = query(collection(db, "products"));
            } else {
                productQuery = query(collection(db, "products"), where("category", "==", category));
            }

            const querySnapshot = await getDocs(productQuery);
            const productList: Product[] = querySnapshot.docs.map((doc) => doc.data() as Product);

            setProducts(productList);
        } catch (error) {
            console.error("Error fetching products: ", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
            } else {
                router.push("/pages/Login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        fetchProducts(selectedCategory);
    }, [selectedCategory]);

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <MarketplaceNavBar />

            <div className="flex flex-grow">
                {/* Sidebar */}
                <MarketplaceSidebar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

                {/* Main Content */}
                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-4">{selectedCategory}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.length > 0 ? (
                            products.map((product, index) => (
                                <div key={index} className="bg-white p-4 shadow rounded">
                                    <img src={product.imageURL} alt={product.name} className="w-full h-48 object-cover mb-4" />
                                    <h2 className="text-lg font-semibold">{product.name}</h2>
                                    <p className="text-gray-600">${product.price}</p>
                                    <p className="text-gray-500">{product.description}</p>
                                </div>
                            ))
                        ) : (
                            <p>No products found for this category.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
