/**
 * Product.ts
 *
 * This file defines the `Product` class, which represents a product listing
 * in the Panther Thrift Shop application. It includes properties for product
 * details such as ID, name, price, category, image URL, description, seller,
 * and sold status. The class provides methods for marking the product as sold,
 * updating product details, and generating a summary. Additionally, it includes
 * a static method for creating a `Product` instance from Firestore data.
 *
 * Key Features:
 * - Represents a product listing with relevant details.
 * - Methods for updating product information and marking items as sold.
 * - Utility function to create `Product` instances from Firestore data.
 *
 * Dependencies:
 * - `FirestoreProductData` interface defines the structure of product data from Firestore.
 *
 * Author: Jayson Baya
 * Last Updated: November 14, 2024
 */

export class Product {
    id: string;
    productName: string;
    price: number;
    category: string;
    imageURL: string;
    description: string;
    seller: string;
    sold: boolean;

    constructor(
        id: string,
        productName: string,
        price: number,
        category: string,
        imageURL: string,
        description: string,
        seller: string,
        sold: boolean = false
    ) {
        this.id = id;
        this.productName = productName;
        this.price = price;
        this.category = category;
        this.imageURL = imageURL;
        this.description = description;
        this.seller = seller;
        this.sold = sold;
    }

    markAsSold() {
        this.sold = true;
    }

    updateDetails(
        productName: string,
        price: number,
        category: string,
        description: string
    ) {
        this.productName = productName;
        this.price = price;
        this.category = category;
        this.description = description;
    }

    getSummary() {
        return `${this.productName} - $${this.price} (${this.category})`;
    }

    static fromFirestoreData(id: string, data: FirestoreProductData): Product {
        return new Product(
            id,
            data.productName,
            data.price,
            data.category,
            data.imageURL,
            data.description,
            data.seller,
            data.sold || false
        );
    }
}

interface FirestoreProductData {
    productName: string;
    price: number;
    category: string;
    imageURL: string;
    description: string;
    seller: string;
    sold?: boolean;
}