import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "FAQ",
    description:
        "Frequently asked questions about Veedu — shipping, returns, payments, and more.",
    openGraph: {
        title: "FAQ",
        description:
            "Frequently asked questions about Veedu — shipping, returns, payments, and more.",
    },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
