import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Search Products",
    description: "Search our collection of home & kitchen essentials.",
    openGraph: {
        title: "Search Products",
        description: "Search our collection of home & kitchen essentials.",
    },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
