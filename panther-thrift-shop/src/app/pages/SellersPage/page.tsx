"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import MarketplaceNavBar from "@/app/components/MarketplaceNavbar";
import MarketplaceSidebar from "@/app/components/MarketplaceSidebar";
import Modal from "@/app/components/Modal"; // Modal component for pop-up

interface Product {
    id: string;
    productName: string;
    price: number;
    category: string;
    imageURL: string;
    description: string;
    seller: string;
    sold?: boolean; // Sold status
}

const SellerPage = () => {
    const [userEmail, setUserEmail] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // For editing
    const [newImage, setNewImage] = useState<File | null>(null); // For new image uploads
    const [showEditModal, setShowEditModal] = useState(false); // State for controlling the pop-up
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const router = useRouter();

    const categories = ["Men's Clothing", "Women's Clothing", "Appliances", "Room Decoration", "Textbooks"];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
                fetchSellerProducts(user.email);
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
            const listings: Product[] = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Product));
            setProducts(listings);
        } catch (error) {
            console.error("Error fetching listings: ", error);
        }
    };

    // Handle product click for editing
    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product); // Set the selected product for editing
        setShowEditModal(true); // Open the modal
    };

    // Handle updating the product
    const handleUpdateProduct = async () => {
        if (selectedProduct) {
            try {
                const productRef = doc(db, "products", selectedProduct.id);
                const updates: Partial<Product> = {
                    productName: selectedProduct.productName,
                    category: selectedProduct.category,
                    price: selectedProduct.price,
                    description: selectedProduct.description,
                    sold: selectedProduct.sold,
                };

                // Handle image upload if a new image is selected
                if (newImage) {
                    const storageRef = ref(storage, `products/${newImage.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, newImage);

                    uploadTask.on(
                        "state_changed",
                        () => {},
                        (error) => {
                            setMessage("Error uploading new image: " + error.message);
                            setShowPopup(true);
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            updates.imageURL = downloadURL; // Add new image URL to the updates
                        }
                    );
                }

                await updateDoc(productRef, updates);
                setMessage("Product updated successfully!");
                setShowPopup(true);
                setSelectedProduct(null); // Reset after update
                setShowEditModal(false); // Close the modal
                fetchSellerProducts(userEmail);
            } catch (error) {
                setMessage("Error updating product: " + (error as Error).message);
                setShowPopup(true);
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <MarketplaceNavBar />

            <div className="flex flex-grow">
                <MarketplaceSidebar selectedCategory={"Selling"} setSelectedCategory={() => {}} />

                <div className="flex-grow p-6">
                    <h1 className="text-2xl font-bold mb-6">My Listings</h1>

                    {/* Existing Listings */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">My Listings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.length > 0 ? (
                                products.map((product, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleEditProduct(product)}
                                        className="bg-white p-4 shadow rounded cursor-pointer"
                                    >
                                        <img
                                            src={product.imageURL}
                                            alt={product.productName}
                                            className="w-full h-48 object-contain mb-4"
                                        />
                                        <h2 className="text-lg font-semibold">{product.productName}</h2>
                                        <p className="text-gray-600">${product.price}</p>
                                        <p className="text-gray-500">{product.description}</p>
                                        {product.sold ? (
                                            <p className="text-red-500 font-bold">Sold</p>
                                        ) : (
                                            <p className="text-green-500 font-bold">Mark As Sold</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No listings found.</p>
                            )}
                        </div>
                    </div>

                    {/* Edit Product Modal */}
                    {selectedProduct && showEditModal && (
                        <Modal onClose={() => setShowEditModal(false)}>
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Edit Product</h2>
                                <div className="mb-4">
                                    <label className="block mb-2 text-gray-700">Product Name</label>
                                    <input
                                        type="text"
                                        value={selectedProduct.productName}
                                        onChange={(e) =>
                                            setSelectedProduct((prev) => ({
                                                ...prev!,
                                                productName: e.target.value,
                                            }))
                                        }
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 text-gray-700">Category</label>
                                    <select
                                        value={selectedProduct.category}
                                        onChange={(e) =>
                                            setSelectedProduct((prev) => ({
                                                ...prev!,
                                                category: e.target.value,
                                            }))
                                        }
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
                                        value={selectedProduct.price}
                                        onChange={(e) =>
                                            setSelectedProduct((prev) => ({
                                                ...prev!,
                                                price: Number(e.target.value),
                                            }))
                                        }
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 text-gray-700">Description</label>
                                    <textarea
                                        value={selectedProduct.description}
                                        onChange={(e) =>
                                            setSelectedProduct((prev) => ({
                                                ...prev!,
                                                description: e.target.value,
                                            }))
                                        }
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 text-gray-700">Change Product Image</label>
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setNewImage(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 text-gray-700">Sold Status</label>
                                    <button
                                        onClick={() =>
                                            setSelectedProduct((prev) => ({
                                                ...prev!,
                                                sold: !prev!.sold,
                                            }))
                                        }
                                        className={`${selectedProduct.sold ? "bg-green-500" : "bg-red-500"
                                        } text-white py-2 px-4 rounded hover:opacity-90 transition`}
                                    >
                                        {selectedProduct.sold ? "Mark as Sold" : "Mark as Sold"}
                                    </button>
                                </div>

                                <button
                                    onClick={handleUpdateProduct}
                                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                                >
                                    Update Product
                                </button>
                            </div>
                        </Modal>
                    )}

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
