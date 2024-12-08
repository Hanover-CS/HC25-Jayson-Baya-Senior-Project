"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MarketplaceNavBar from "@/components/MarketplaceNavbar";
import MarketplaceSidebar from "@/components/MarketplaceSidebar";
import routeToCategory from "@/components/routeToCategory";

type ClientLayoutWrapperProps = {
    children: React.ReactNode;
};

const ClientLayoutWrapper: React.FC<ClientLayoutWrapperProps> = ({ children }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("Browse All");
    const router = useRouter();

    // Update selected category based on current route
    useEffect(() => {
        const pathname = window.location.pathname;
        const category = routeToCategory(pathname);
        setSelectedCategory(category);
    }, [router]);

    // Handle category change and route navigation
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        router.push(`/pages/${category.replace(/\s+/g, "")}Page`);
    };

    return (
        <>
            <MarketplaceNavBar />
            <div className="flex">
                <MarketplaceSidebar
                    selectedCategory={selectedCategory}
                    setSelectedCategory={handleCategoryChange}
                />
                <main className="flex-grow p-6">{children}</main>
            </div>
        </>
    );
};

export default ClientLayoutWrapper;
