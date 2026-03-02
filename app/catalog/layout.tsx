import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shop All Products — Veedu",
    description: "Browse our full catalog of premium home accessories, kitchen essentials, and modern home utility items. Free shipping on orders over ₹499.",
    openGraph: {
        title: "Shop All Products — Veedu",
        description: "Browse our full catalog of premium home accessories, kitchen essentials, and modern home utility items.",
        type: "website",
    },
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
