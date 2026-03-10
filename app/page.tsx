'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';

const categories = ['All Items', 'Kitchen', 'Laundry', 'Home & Bath', 'Organization'];

function ProductsSection() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p => {
    if (activeCategory !== 'All Items' && p.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Featured Essentials</h2>
        {searchQuery ? (
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
            Showing results for &ldquo;<strong>{searchQuery}</strong>&rdquo;
          </p>
        ) : (
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>
            Carefully selected high-utility items for your daily needs.
          </p>
        )}
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: activeCategory === category ? 'var(--foreground)' : 'transparent',
                color: activeCategory === category ? 'var(--white)' : 'var(--gray-500)',
              }}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-[2rem] aspect-[3/4] animate-pulse" style={{ backgroundColor: 'var(--gray-100)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, index) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--gray-400)' }}>
            {searchQuery ? `No results for "${searchQuery}"` : 'No products in this category yet.'}
          </p>
          {searchQuery && (
            <a href="/" className="text-sm font-medium underline" style={{ color: 'var(--accent)' }}>
              Clear search
            </a>
          )}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--gray-500)' }}>
                🛋️ Curated Modern Home Utility
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-balance" style={{ color: 'var(--foreground)' }}>
              Organize your{' '}
              <span style={{ color: 'var(--green)' }}>kitchen space</span>
              <br />
              with elegance.
            </h1>
            <p className="text-base lg:text-xl leading-relaxed mb-8 max-w-md text-balance" style={{ color: 'var(--gray-500)' }}>
              Discover a premium collection of highly absorbent cloths, airtight storage solutions, and minimalist kitchen tools designed for the modern home.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#products"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-lg)]"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Shop Collection
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
              <a
                href="#products"
                className="inline-flex items-center gap-2 px-6 py-4 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--foreground)' }}
              >
                View Catalog
              </a>
            </div>
          </div>

          <div className="relative animate-slide-up">
            <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] transition-transform duration-700 hover:scale-[1.02]" style={{ backgroundColor: 'var(--gray-100)', boxShadow: 'var(--shadow-xl)' }}>
              <img
                src="/images/airtight_container.png"
                alt="Organized Kitchen Container"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute -bottom-6 -right-6 sm:bottom-6 sm:right-6 px-5 py-4 rounded-2xl flex items-center gap-4 glass animate-pulse-slow transition-transform hover:scale-105"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--green-light)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <p className="text-sm font-extrabold tracking-wide" style={{ color: 'var(--foreground)' }}>High Quality</p>
                <p className="text-xs font-medium" style={{ color: 'var(--gray-500)' }}>Certified Utility</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p style={{ color: 'var(--gray-400)' }}>Loading products...</p>
        </div>
      }>
        <ProductsSection />
      </Suspense>

      <Footer />
    </div>
  );
}

