"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import MarketplaceNavBar from "@/app/components/MarketplaceNavbar";
import MarketplaceSidebar from "@/app/components/MarketplaceSidebar";

// Define the structure of a Purchase document
interface Purchase {
    productName: string;
    price: number;
    offerStatus: string;
    buyer: string;
}

const BuyingPage = () => {
    const [userEmail, setUserEmail] = useState("");
    const [purchases, setPurchases] = useState<Purchase[]>([]); // Use the Purchase type
    const [selectedCategory, setSelectedCategory] = useState("Buying");
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
                fetchPurchases(user.email); // Fetch the user's purchases
            } else {
                router.push("/pages/Login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Fetch the user's purchases from Firestore
    const fetchPurchases = async (userEmail: string | null) => {
        try {
            const purchasesQuery = query(collection(db, "purchases"), where("buyer", "==", userEmail));
            const querySnapshot = await getDocs(purchasesQuery);
            const purchaseList: Purchase[] = querySnapshot.docs.map((doc) => doc.data() as Purchase);
            setPurchases(purchaseList);
        } catch (error) {
            console.error("Error fetching purchases: ", error);
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
                    <h1 className="text-2xl font-bold mb-4">Your Purchases/Offers</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {purchases.length > 0 ? (
                            purchases.map((purchase, index) => (
                                <div key={index} className="bg-white p-4 shadow rounded">
                                    <h2 className="text-lg font-semibold">Product: {purchase.productName}</h2>
                                    <p className="text-gray-600">Price: ${purchase.price}</p>
                                    <p className="text-gray-500">Status: {purchase.offerStatus}</p>
                                </div>
                            ))
                        ) : (
                            <p>You have no purchases or offers.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyingPage;
