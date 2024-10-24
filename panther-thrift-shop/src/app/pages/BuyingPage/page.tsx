"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import MarketplaceNavBar from "@/app/components/MarketplaceNavbar";
import MarketplaceSidebar from "@/app/components/MarketplaceSidebar";

interface Product {
    productName: string;
    price: number;
    category: string;
    imageURL: string;
    description: string;
    seller: string;
}

const BuyingPage = () => {
    const [userEmail, setUserEmail] = useState("");
    const [savedItems, setSavedItems] = useState<Product[]>([]); // Saved items
    const [purchasedItems, setPurchasedItems] = useState<Product[]>([]); // Purchased items
    const [offers, setOffers] = useState<Product[]>([]); // Offers made by user
    const [selectedTab, setSelectedTab] = useState("Saved Items"); // Default tab
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
                fetchSavedItems(user.email);
                fetchPurchasedItems(user.email);
                fetchOffers(user.email);
            } else {
                router.push("/pages/Login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Fetch saved items (mock implementation for now)
    const fetchSavedItems = async (email: string | null) => {
        try {
            const savedItemsQuery = query(collection(db, "savedItems"), where("buyerEmail", "==", email));
            const querySnapshot = await getDocs(savedItemsQuery);
            const items: Product[] = querySnapshot.docs.map((doc) => doc.data() as Product);
            setSavedItems(items);
        } catch (error) {
            console.error("Error fetching saved items:", error);
        }
    };

    // Fetch purchased items (mock implementation for now)
    const fetchPurchasedItems = async (email: string | null) => {
        try {
            const purchasedQuery = query(collection(db, "purchasedItems"), where("buyerEmail", "==", email));
            const querySnapshot = await getDocs(purchasedQuery);
            const items: Product[] = querySnapshot.docs.map((doc) => doc.data() as Product);
            setPurchasedItems(items);
        } catch (error) {
            console.error("Error fetching purchased items:", error);
        }
    };

    // Fetch offers (mock implementation for now)
    const fetchOffers = async (email: string | null) => {
        try {
            const offersQuery = query(collection(db, "offers"), where("buyerEmail", "==", email));
            const querySnapshot = await getDocs(offersQuery);
            const items: Product[] = querySnapshot.docs.map((doc) => doc.data() as Product);
            setOffers(items);
        } catch (error) {
            console.error("Error fetching offers:", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <MarketplaceNavBar />

            <div className="flex flex-grow">
                {/* Sidebar */}
                <MarketplaceSidebar selectedCategory={"Buying"} setSelectedCategory={() => {}} />

                {/* Main Content */}
                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-6">My Buying Page</h1>

                    {/* Tabs for Saved Items, Purchased Orders, and Offers */}
                    <div className="mb-4">
                        <button
                            onClick={() => setSelectedTab("Saved Items")}
                            className={`px-4 py-2 ${selectedTab === "Saved Items" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                        >
                            Saved Items
                        </button>
                        <button
                            onClick={() => setSelectedTab("Purchased Orders")}
                            className={`ml-2 px-4 py-2 ${selectedTab === "Purchased Orders" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                        >
                            Purchased Orders
                        </button>
                        <button
                            onClick={() => setSelectedTab("Offers")}
                            className={`ml-2 px-4 py-2 ${selectedTab === "Offers" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                        >
                            Offers
                        </button>
                    </div>

                    {/* Content based on selected tab */}
                    {selectedTab === "Saved Items" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Saved Items</h2>
                            {savedItems.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {savedItems.map((item, index) => (
                                        <div key={index} className="bg-white p-4 shadow rounded">
                                            <img src={item.imageURL} alt={item.productName} className="w-full h-48 object-cover mb-4" />
                                            <h2 className="text-lg font-semibold">{item.productName}</h2>
                                            <p className="text-gray-600">${item.price}</p>
                                            <p className="text-gray-500">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No saved items yet.</p>
                            )}
                        </div>
                    )}

                    {selectedTab === "Purchased Orders" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Purchased Orders</h2>
                            {purchasedItems.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {purchasedItems.map((item, index) => (
                                        <div key={index} className="bg-white p-4 shadow rounded">
                                            <img src={item.imageURL} alt={item.productName} className="w-full h-48 object-cover mb-4" />
                                            <h2 className="text-lg font-semibold">{item.productName}</h2>
                                            <p className="text-gray-600">${item.price}</p>
                                            <p className="text-gray-500">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No purchased items yet.</p>
                            )}
                        </div>
                    )}

                    {selectedTab === "Offers" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Offers</h2>
                            {offers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {offers.map((item, index) => (
                                        <div key={index} className="bg-white p-4 shadow rounded">
                                            <img src={item.imageURL} alt={item.productName} className="w-full h-48 object-cover mb-4" />
                                            <h2 className="text-lg font-semibold">{item.productName}</h2>
                                            <p className="text-gray-600">Your offer: $xx.xx</p>
                                            <p className="text-gray-500">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No offers made yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuyingPage;
