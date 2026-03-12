import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Checkout",
    description:
        "Complete your order with secure UPI payment. Free delivery across Kerala.",
    openGraph: {
        title: "Checkout",
        description: "Complete your order with secure UPI payment. Free delivery across Kerala.",
    },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
