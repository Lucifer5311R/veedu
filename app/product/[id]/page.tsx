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
                                {product.inStock === false && (
                                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full"
                                        style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}>Out of Stock</span>
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
                                    disabled={product.inStock === false}
                                    className="flex-1 py-4 rounded-full font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    style={{ backgroundColor: addedToCart ? 'var(--green)' : 'var(--accent)' }}
                                >
                                    {product.inStock === false ? 'Out of Stock' : addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
                                </button>
                            </div>

                            <div className="flex gap-3 mb-4">
                                <Link href="/cart"
                                    className="flex-1 py-4 rounded-full font-bold text-center transition-all hover:scale-[1.02] hover:shadow-lg block"
                                    style={{ border: '2px solid var(--accent)', color: 'var(--accent)' }}>
                                    View Cart
                                </Link>
                                <a
                                    href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi! I'm interested in ordering:\n\n*${product.title}*\nPrice: ₹${product.sellingPrice.toLocaleString('en-IN')}\n\n${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-4 rounded-full font-bold text-center transition-all hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2"
                                    style={{ backgroundColor: '#25D366', color: 'white' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    Order via WhatsApp
                                </a>
                            </div>

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
