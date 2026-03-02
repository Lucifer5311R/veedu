import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Product — Veedu",
    description: "Shop premium home accessories and kitchen essentials at Veedu. Quality products at great prices.",
    openGraph: {
        title: "Product — Veedu",
        description: "Shop premium home accessories and kitchen essentials at Veedu.",
        type: "website",
    },
};

export default function ProductLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
