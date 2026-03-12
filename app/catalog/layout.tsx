import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Catalog — Shop All Products",
    description:
        "Browse our complete collection of home & kitchen essentials. Quality products at the best prices, delivered across Kerala.",
    openGraph: {
        title: "Catalog — Shop All Products",
        description:
            "Browse our complete collection of home & kitchen essentials. Quality products at the best prices, delivered across Kerala.",
    },
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
