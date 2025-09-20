import { mockProducts, mockCollections, findProductBySlug, listProductsByCollection } from '../fixtures/products'

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export async function fetchFeaturedProducts() {
  await delay(120);
  return mockProducts.slice(0, 3);
}

export async function fetchCollections() {
  await delay(90);
  return mockCollections;
}

export async function fetchProduct(slug: string) {
  await delay(110);
  return findProductBySlug(slug);
}

export async function fetchProductsByCollection(slug: string) {
  await delay(140);
  return listProductsByCollection(slug);
}

export async function searchProducts(query: string) {
  await delay(130);
  const q = query.toLowerCase();
  return mockProducts.filter(p => p.name.toLowerCase().includes(q) || p.slug.includes(q));
}
