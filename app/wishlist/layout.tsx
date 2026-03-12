import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Wishlist",
    description: "Your saved products. Add items to cart when you're ready.",
    openGraph: {
        title: "My Wishlist",
        description: "Your saved products. Add items to cart when you're ready.",
    },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
