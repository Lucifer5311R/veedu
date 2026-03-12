import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shopping Cart",
    description: "Review items in your cart and proceed to checkout.",
    openGraph: {
        title: "Shopping Cart",
        description: "Review items in your cart and proceed to checkout.",
    },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
