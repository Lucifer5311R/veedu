import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://veedu-26.vercel.app";

const staticPages: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/catalog", priority: 0.8 },
  { path: "/new-arrivals", priority: 0.8 },
  { path: "/about", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
  { path: "/bulk-order", priority: 0.7 },
  { path: "/wishlist", priority: 0.7 },
  { path: "/faq", priority: 0.7 },
  { path: "/privacy-policy", priority: 0.7 },
  { path: "/terms", priority: 0.7 },
  { path: "/shipping-policy", priority: 0.7 },
  { path: "/returns", priority: 0.7 },
];

async function fetchPublishedProducts(): Promise<
  { id: string; createdAt?: string }[]
> {
  try {
    const res = await fetch(`${BASE_URL}/api/products`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.priority === 1 ? "daily" : "weekly",
    priority: page.priority,
  }));

  const products = await fetchPublishedProducts();

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/product/${product.id}`,
    lastModified: product.createdAt ? new Date(product.createdAt) : now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticEntries, ...productEntries];
}
