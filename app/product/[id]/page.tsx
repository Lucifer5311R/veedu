'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartProvider';
import { useWishlist } from '@/context/WishlistProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();

    const [product, setProduct] = useState<Product | null>(null);
    const [related, setRelated] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/products?id=${id}`);
                if (!res.ok) { router.push('/catalog'); return; }
                const data: Product = await res.json();
                setProduct(data);

                // Fetch related products from same category
                const allRes = await fetch('/api/products');
                if (allRes.ok) {
                    const all: Product[] = await allRes.json();
                    setRelated(all.filter(p => p.category === data.category && p.id !== data.id).slice(0, 4));
                }
            } catch {
                router.push('/catalog');
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id, router]);

    const handleAddToCart = () => {
        if (!product) return;
        for (let i = 0; i < quantity; i++) addToCart(product);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F5' }}>
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: 'var(--green)', borderTopColor: 'transparent' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--gray-500)' }}>Loading product…</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!product) return null;

    const wishlisted = isWishlisted(product.id);
    const discount = product.price > 0
        ? Math.round(((product.price - product.sellingPrice) / product.price) * -100)
        : 0;

    return (
        <>
            <Navbar />
            <div className="min-h-screen" style={{ backgroundColor: '#FAF8F5' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--gray-400)' }}>
                        <Link href="/" className="hover:underline">Home</Link>
                        <span>/</span>
                        <Link href="/catalog" className="hover:underline">Catalog</Link>
                        <span>/</span>
                        <span className="line-clamp-1" style={{ color: 'var(--foreground)' }}>{product.title}</span>
                    </nav>

                    {/* Product Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

                        {/* Image Gallery */}
                        <div>
                            {/* Main Image */}
                            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden mb-4" style={{ backgroundColor: '#F3F4F3' }}>
                                {product.images?.[selectedImage] ? (
                                    <img
                                        src={product.images[selectedImage]}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1">
                                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                        </svg>
                                    </div>
                                )}
                                {/* Wishlist */}
                                <button
                                    onClick={() => toggleWishlist(product)}
                                    className="absolute top-5 right-5 w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                                    style={{ backgroundColor: 'var(--white)', boxShadow: 'var(--shadow-md)' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24"
                                        fill={wishlisted ? 'var(--accent)' : 'none'}
                                        stroke={wishlisted ? 'var(--accent)' : 'var(--gray-600)'}
                                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-1">
                                    {product.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(i)}
                                            className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all"
                                            style={{
                                                border: selectedImage === i ? '2px solid var(--green)' : '2px solid transparent',
                                                backgroundColor: '#F3F4F3',
                                            }}
                                        >
                                            <img src={img} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            {/* Category + New badge */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                                    style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-500)' }}>
                                    {product.category}
                                </span>
                                {product.isNew && (
                                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full text-white"
                                        style={{ backgroundColor: 'var(--accent)' }}>New</span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 leading-tight" style={{ color: 'var(--foreground)' }}>
                                {product.title}
                            </h1>

                            {/* Price */}
                            <div className="flex items-baseline gap-4 mb-6">
                                <span className="text-4xl font-extrabold" style={{ color: 'var(--foreground)' }}>
                                    ₹{product.sellingPrice.toLocaleString('en-IN')}
                                </span>
                                {product.price !== product.sellingPrice && (
                                    <>
                                        <span className="text-lg line-through" style={{ color: 'var(--gray-400)' }}>
                                            ₹{product.price.toLocaleString('en-IN')}
                                        </span>
                                        {discount > 0 && (
                                            <span className="text-sm font-bold px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: '#E8F5E9', color: 'var(--green)' }}>
                                                {discount}% off
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--gray-500)' }}>
                                {product.description}
                            </p>

                            {/* Quantity + Add to Cart */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ border: '1px solid var(--gray-200)' }}>
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg transition hover:opacity-70"
                                        style={{ color: 'var(--foreground)' }}>−</button>
                                    <span className="w-6 text-center text-sm font-bold" style={{ color: 'var(--foreground)' }}>{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)}
                                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg transition hover:opacity-70"
                                        style={{ color: 'var(--foreground)' }}>+</button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 py-4 rounded-full font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                                    style={{ backgroundColor: addedToCart ? 'var(--green)' : 'var(--accent)' }}
                                >
                                    {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
                                </button>
                            </div>

                            <Link href="/cart"
                                className="w-full py-4 rounded-full font-bold text-center transition-all hover:scale-[1.02] hover:shadow-lg block"
                                style={{ border: '2px solid var(--accent)', color: 'var(--accent)' }}>
                                View Cart
                            </Link>

                            {/* Trust signals */}
                            <div className="mt-8 grid grid-cols-2 gap-3">
                                {[
                                    { icon: '🚚', text: 'Free delivery in Kerala' },
                                    { icon: '↩️', text: 'Easy returns' },
                                    { icon: '✅', text: 'Quality assured' },
                                    { icon: '💬', text: 'WhatsApp support' },
                                ].map(item => (
                                    <div key={item.text} className="flex items-center gap-2 p-3 rounded-2xl" style={{ backgroundColor: 'var(--white)' }}>
                                        <span>{item.icon}</span>
                                        <span className="text-xs font-medium" style={{ color: 'var(--gray-500)' }}>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Related Products */}
                    {related.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-extrabold mb-6" style={{ color: 'var(--foreground)' }}>
                                More in {product.category}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                                {related.map(p => (
                                    <Link href={`/product/${p.id}`} key={p.id} className="group block">
                                        <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-3 transition-transform duration-500 group-hover:shadow-lg" style={{ backgroundColor: '#F3F4F3' }}>
                                            {p.images?.[0] ? (
                                                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold line-clamp-1 mb-1" style={{ color: 'var(--foreground)' }}>{p.title}</p>
                                        <p className="text-base font-extrabold" style={{ color: 'var(--foreground)' }}>₹{p.sellingPrice.toLocaleString('en-IN')}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
