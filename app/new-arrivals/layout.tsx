import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "New Arrivals — Veedu",
    description: "Discover the latest additions to our collection. Fresh home accessories and kitchen essentials added weekly.",
    openGraph: {
        title: "New Arrivals — Veedu",
        description: "Discover the latest additions to our collection. Fresh home accessories and kitchen essentials added weekly.",
        type: "website",
    },
};

export default function NewArrivalsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
