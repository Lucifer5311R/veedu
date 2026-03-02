import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartProvider";
import { WishlistProvider } from "@/context/WishlistProvider";
import NextAuthSessionProvider from "@/components/NextAuthSessionProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Veedu — Home & Kitchen Essentials",
  description: "Premium home accessories and kitchen utility items. Curated modern home utility for your everyday needs.",
  keywords: ["home accessories", "kitchen essentials", "home utility", "modern home"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} antialiased`} style={{ fontFamily: "'Inter', sans-serif" }}>
        <NextAuthSessionProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}

