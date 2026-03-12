import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us",
    description:
        "Learn about Veedu — Kerala's trusted online store for premium home & kitchen essentials. Quality products, affordable prices, delivered to your doorstep.",
    openGraph: {
        title: "About Veedu",
        description: "Kerala's trusted home & kitchen store",
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
