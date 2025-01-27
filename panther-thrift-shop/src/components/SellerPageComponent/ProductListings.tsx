import React from "react";

interface Product {
    id: string;
    productName: string;
    price: number;
    category: string;
    imageURL: string;
    description: string;
    seller: string;
    sold?: boolean;
    createdAt: string;
}

interface ProductListingsProps {
    products: Product[];
    handleEditProduct: (product: Product) => void;
}

const ProductListings: React.FC<ProductListingsProps> = ({
                                                             products,
                                                             handleEditProduct,
                                                         }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">My Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div
                            key={product.id} // Ensure the unique `id` field is used
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
    );
};

export default ProductListings;
