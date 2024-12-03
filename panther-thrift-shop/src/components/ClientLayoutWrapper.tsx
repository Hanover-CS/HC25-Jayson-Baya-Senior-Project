"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MarketplaceNavBar from "@/components/MarketplaceNavbar";
import MarketplaceSidebar from "@/components/MarketplaceSidebar";
import routeToCategory from "@/components/routeToCategory";

const ClientLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("Browse All");
    const router = useRouter();

    useEffect(() => {
        const pathname = window.location.pathname; // Get the current route
        const category = routeToCategory(pathname); // Get the corresponding category/section
        setSelectedCategory(category); // Update the selected category
    }, [router]);

    return (
        <>
            <MarketplaceNavBar />
            <div className="flex">
                <MarketplaceSidebar
                    selectedCategory={selectedCategory}
                    setSelectedCategory={(category) => {
                        setSelectedCategory(category);
                        router.push(
                            `/pages/${category.replace(" ", "")}Page`
                        );
                    }}
                />
                <main className="flex-grow p-6">{children}</main>
            </div>
        </>
    );
};

export default ClientLayoutWrapper;
