import React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";


// Define fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Metadata for the application
export const metadata: Metadata = {
  title: "Panther Thrift Shop",
  description: "A campus-focused marketplace for buying and selling items.",
};

// Root layout wrapper
const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
    <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
    </body>
    </html>
);

export default RootLayout;
