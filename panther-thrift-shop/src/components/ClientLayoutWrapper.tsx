"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import MarketplaceNavBar from "@/components/MarketplaceNavbar";
import MarketplaceSidebar from "@/components/MarketplaceSidebar";
import NavBar from "@/components/Navbar"; // Navbar with Login/SignUp
import routeToCategory from "@/components/routeToCategory";
import {onAuthStateChanged} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

type ClientLayoutWrapperProps = {
    children: React.ReactNode;
};

const ClientLayoutWrapper: React.FC<ClientLayoutWrapperProps> = ({ children }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("Browse All");
    const [, setUserEmail] = useState<string>("");
    const router = useRouter();
    const pathname = usePathname();

    // Update selected category based on current route
    useEffect(() => {
        if (!isAuthPage() && !isHomePage()) {
            const category = routeToCategory(pathname);
            setSelectedCategory(category);
        }
    }, [pathname]);


    // Check if the current route is an auth page (login or signup)
    const isAuthPage = () => {
        return pathname.startsWith("/pages/Login") || pathname.startsWith("/pages/SignUp");
    };

    // Check if the current route is the homepage
    const isHomePage = () => {
        return pathname === "/";
    };

    // Handle category change and route navigation for marketplace pages
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        router.push(`/pages/${category.replace(/\s+/g, "")}Page`);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <>
            {isAuthPage() || isHomePage() ? (
                // Render NavBar for homepage or auth pages
                <>
                    <NavBar />
                    <main className="flex-grow p-6">{children}</main>
                </>
            ) : (
                // Render Marketplace layout for other pages
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
            )}
        </>
    );
};

export default ClientLayoutWrapper;
