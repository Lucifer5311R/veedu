import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Track Your Orders",
    description:
        "Track your Veedu orders. Enter your phone number to view order status and delivery updates.",
    openGraph: {
        title: "Track Your Orders",
        description:
            "Track your Veedu orders. Enter your phone number to view order status and delivery updates.",
    },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
