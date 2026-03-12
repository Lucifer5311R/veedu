import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/CartProvider";
import { WishlistProvider } from "@/context/WishlistProvider";
import NextAuthSessionProvider from "@/components/NextAuthSessionProvider";
import { ToastProvider } from "@/context/ToastProvider";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Veedu — Home & Kitchen Essentials",
    template: "%s | Veedu",
  },
  description: "Premium home accessories and kitchen utility items. Curated modern home utility for your everyday needs. Delivering quality to Kerala homes.",
  keywords: ["home accessories", "kitchen essentials", "home utility", "modern home", "Kerala", "kitchen organization"],
  openGraph: {
    type: "website",
    siteName: "Veedu",
    title: "Veedu — Home & Kitchen Essentials",
    description: "Premium home accessories and kitchen utility items for the modern Indian home.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veedu — Home & Kitchen Essentials",
    description: "Premium home accessories and kitchen utility items for the modern Indian home.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} antialiased`} style={{ fontFamily: "'Inter', sans-serif" }}>
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
        <NextAuthSessionProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                {children}
                <BottomNav />
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}

