export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;        // Original scraped price
    sellingPrice: number; // Markup price shown to customer
    images: string[];
    category: string;
    sourceUrl: string;    // Original Meesho link
    status: 'staged' | 'published';
    isNew?: boolean;
    inStock?: boolean;
    createdAt: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Order {
    id: string;
    items: CartItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    customer: CustomerDetails;
    upiTransactionId?: string;
    status: 'pending' | 'paid' | 'shipped' | 'delivered';
    createdAt: string;
}

export interface CustomerDetails {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

export interface Review {
    id: string;
    productId: string;
    name: string;
    rating: number;
    comment: string;
    approved: boolean;
    createdAt: string;
}
