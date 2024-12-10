export const categories = ["Men's Clothing", "Women's Clothing", "Appliances", "Room Decoration", "Textbooks"];

export const FIRESTORE_COLLECTIONS = {
    PRODUCTS: "products",
    SAVED_ITEMS: "savedItems",
    PURCHASED_ITEMS: "purchasedItems",
    OFFERS: "offers",
};

export const FIRESTORE_FIELDS = {
    SOLD: "sold",
    BUYER_EMAIL: "buyerEmail",
    PRODUCT_ID: "productId",
    PRODUCT_NAME: "productName",
    PRICE: "price",
    IMAGE_URL: "imageURL",
    DESCRIPTION: "description",
    CATEGORY: "category",
    SELLER: "seller",
    CREATED_AT: "createdAt",
};

export const ROUTES = {
    LOGIN: "/pages/Login",
    SELLERS_PAGE: "/pages/SellersPage",
};

export const TAB_NAMES = {
    SAVED_ITEMS: "Saved Items",
    PURCHASED_ORDERS: "Purchased Orders",
    OFFERS: "Offers",
};

export const handleSaveProductAlert = {
    SAVED_ITEMS: "Item saved successfully!",
    Error: "Error saving product:",
    Alert: "Error saving item. Please try again."
}

export const fetchProductsAlert = {
    Error: "Error fetching products:",
    Alert: "Error fetching products. Please try again later."
}

export const renderTabContentMessage = {
    emptySaved: "No saved items yet.",
    emptyPurchased: "No purchased items yet.",
    emptyOffers: "No offers made yet."
}