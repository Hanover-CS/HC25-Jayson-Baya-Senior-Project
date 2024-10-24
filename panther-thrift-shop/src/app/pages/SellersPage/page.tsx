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
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // For editing
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

    // Handle form submission for creating a new listing
    const handleCreateListing = async () => {
        if (!name || !category || !image || !price || !description) {
            setMessage("All fields are required!");
            setShowPopup(true);
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
                setShowPopup(true);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                try {
                    await addDoc(collection(db, "products"), {
                        productName: name,
                        category,
                        price,
                        description,
                        imageURL: downloadURL,
                        seller: userEmail,
                        createdAt: new Date(),
                    });

                    setMessage("Product listed successfully!");
                    setShowPopup(true);

                    setName("");
                    setCategory("");
                    setPrice(0);
                    setDescription("");
                    setImage(null);

                    fetchSellerProducts(userEmail);
                } catch (error) {
                    setMessage("Error adding product: " + (error as Error).message);
                    setShowPopup(true);
                }
            }
        );
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
                await updateDoc(productRef, {
                    productName: selectedProduct.productName,
                    category: selectedProduct.category,
                    price: selectedProduct.price,
                    description: selectedProduct.description,
                    sold: selectedProduct.sold,
                });

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

                    {/* Create New Listing */}
                    <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto mb-6">
                        <h2 className="text-xl font-bold mb-4">Create New Listing</h2>
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
                                        setImage(e.target.files[0]);
                                    }
                                }}
                                className="w-full"
                            />
                        </div>

                        <button
                            onClick={handleCreateListing}
                            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                        >
                            Create Listing
                        </button>
                    </div>

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
                                            <p className="text-green-500 font-bold">Still Selling</p>
                                        )}
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
                    <label className="block mb-2 text-gray-700">Product Images</label>
                    <input
                        type="file"
                        multiple
                        onChange={(e) => {
                            if (e.target.files) {
                                const files = Array.from(e.target.files);
                                // Logic to handle uploading multiple files
                                // Set the selected files here or manage them accordingly
                            }
                        }}
                        className="w-full"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-gray-700">Status</label>
                    <select
                        value={selectedProduct.sold ? "Sold" : "Still Selling"}
                        onChange={(e) =>
                            setSelectedProduct((prev) => ({
                                ...prev!,
                                sold: e.target.value === "Sold",
                            }))
                        }
                        className="w-full p-2 border rounded"
                    >
                        <option value="Still Selling">Still Selling</option>
                        <option value="Sold">Sold</option>
                    </select>
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
</div>
</div>
</div>
);
};

export default SellerPage;
