const routeToCategory = (pathname: string): string => {
    // Special sections like Browse, Buying, and Selling
    const specialSections = [
        { name: "Browse All", path: "/pages/BrowsePage" },
        { name: "Buying", path: "/pages/BuyingPage" },
        { name: "Selling", path: "/pages/SellersPage" },
    ];

    const categories = [
        { name: "Men's Clothing", path: "/marketplace/mens-clothing" },
        { name: "Women's Clothing", path: "/marketplace/womens-clothing" },
        { name: "Appliances", path: "/marketplace/appliances" },
        { name: "Room Decoration", path: "/marketplace/room-decoration" },
        { name: "Textbooks", path: "/marketplace/textbooks" },
    ];

    // Combine both arrays for easier lookup
    const allSections = [...specialSections, ...categories];

    // Find the section or category that matches the current pathname
    const matchedSection = allSections.find((section) =>
        pathname.startsWith(section.path)
    );

    // Return the name of the matched section or category; default to "Browse All"
    return matchedSection ? matchedSection.name : "Browse All";
};

export default routeToCategory;
