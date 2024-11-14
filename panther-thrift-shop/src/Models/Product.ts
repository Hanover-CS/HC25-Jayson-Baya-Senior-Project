// Product.ts

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