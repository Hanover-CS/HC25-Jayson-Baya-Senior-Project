"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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

const SellerPage = () => {
    const [userEmail, setUserEmail] = useState("");
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [products, setProducts] = useState<Product[]>([]); // For existing listings
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false); // State for showing the popup
    const router = useRouter();

    const categories = ["Men's Clothing", "Women's Clothing", "Appliances", "Room Decoration", "Textbooks"];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
                fetchSellerProducts(user.email); // Fetch the current user's listings
            } else {
                router.push("/pages/Login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Fetch seller's listings from Firestore
    const fetchSellerProducts = async (userEmail: string | null) => {
        try {
            const q = query(collection(db, "products"), where("seller", "==", userEmail));
            const querySnapshot = await getDocs(q);
            const listings: Product[] = querySnapshot.docs.map((doc) => doc.data() as Product);
            setProducts(listings); // Update the listings
        } catch (error) {
            console.error("Error fetching listings: ", error);
        }
    };

    // Handle form submission and image upload
    const handleSubmit = async () => {
        if (!name || !category || !image || !price || !description) {
            setMessage("All fields are required!");
            setShowPopup(true); // Show popup for error
            return;
        }

        // Upload image to Firebase Storage
        const storageRef = ref(storage, `products/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
            "state_changed",
            () => {},
            (error) => {
                setMessage("Error uploading image: " + error.message);
                setShowPopup(true); // Show error popup
            },
            async () => {
                // Get image URL once uploaded
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                // Add product to Firestore once the image URL is ready
                try {
                    await addDoc(collection(db, "products"), {
                        productName: name,
                        category,
                        price,
                        description,
                        imageURL: downloadURL, // Store the image URL in Firestore
                        seller: userEmail,
                        createdAt: new Date(),
                    });

                    //console.log("Form fields:", { name, category, price, description });
                    //console.log("Image upload URL:", downloadURL);

                    // Add the new product to the existing list without refetching
                    setProducts((prevProducts) => [
                        ...prevProducts,
                        {
                            productName: name,
                            category,
                            price,
                            description,
                            imageURL: downloadURL,
                            seller: userEmail,
                        },
                    ]);

                    setMessage("Product listed successfully!");
                    setShowPopup(true); // Show success popup
                    // Reset form
                    setName("");
                    setCategory("");
                    setPrice(0);
                    setDescription("");
                    setImage(null);
                } catch (error) {
                    setMessage("Error adding product: " + (error as Error).message);
                    setShowPopup(true); // Show error popup
                }
            }
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            <MarketplaceNavBar />

            <div className="flex flex-grow">
                {/* Sidebar */}
                <MarketplaceSidebar selectedCategory={"Selling"} setSelectedCategory={() => {}} />

                {/* Main Content */}
                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>

                    <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto mb-6">
                        <div className="mb-4">
                            <label className="block mb-2 text-gray-700">Product Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 text-gray-700">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select Category</option>
                                {categories.map((category, idx) => (
                                    <option key={idx} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 text-gray-700">Price</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 text-gray-700">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 text-gray-700">Product Image</label>
                            <input
                                type="file"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setImage(e.target.files[0]); // Safely set the image if a file is selected
                                    }
                                }}
                                className="w-full"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                        >
                            Create Listing
                        </button>
                    </div>

                    {/* Display existing listings */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">My Listings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.length > 0 ? (
                                products.map((listing, index) => (
                                    <div key={index} className="bg-white p-4 shadow rounded">
                                        <img
                                            src={listing.imageURL}
                                            alt={listing.productName}
                                            className="w-full h-48 object-cover mb-4"
                                        />
                                        <h2 className="text-lg font-semibold">{listing.productName}</h2>
                                        <p className="text-gray-600">${listing.price}</p>
                                        <p className="text-gray-500">{listing.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No listings found.</p>
                            )}
                        </div>
                    </div>

                    {/* Popup for success or error messages */}
                    {showPopup && (
                        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded shadow-md text-center">
                                <p>{message}</p>
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
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

export default SellerPage;
