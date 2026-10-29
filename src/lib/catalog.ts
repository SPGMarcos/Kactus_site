import { configured, publicDB } from './supabase';
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  featured: boolean;
  created_at: string;
  category_id: string | null;
  collection_id: string | null;
  product_images: { path: string; alt: string; position: number }[];
};
export type Variant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  available: number;
};
export type Taxonomy = { id: string; name: string; slug: string };
export async function catalog(params: Record<string, string | undefined> = {}) {
  if (!configured())
    return { products: [] as Product[], count: 0, error: false };
  const { data, error } = await publicDB().rpc('search_catalog', {
    p_query: params.q || '',
    p_category: params.category || null,
    p_collection: params.collection || null,
    p_size: params.size || '',
    p_color: params.color || '',
    p_available: !!params.available,
    p_featured: !!params.featured,
    p_sort: params.sort || 'new',
    p_page: Math.max(1, Number(params.page) || 1),
  });
  return {
    products: (data?.products || []) as Product[],
    count: Number(data?.count || 0),
    error: !!error,
  };
}
export async function variants(id: string): Promise<Variant[]> {
  if (!configured()) return [];
  const { data } = await publicDB().rpc('catalog_variants', { p_product: id });
  return data || [];
}
export async function taxonomies() {
  if (!configured())
    return { categories: [] as Taxonomy[], collections: [] as Taxonomy[] };
  const db = publicDB();
  const [a, b] = await Promise.all([
    db.from('categories').select('id,name,slug').order('name'),
    db
      .from('collections')
      .select('id,name,slug')
      .eq('active', true)
      .order('month', { ascending: false }),
  ]);
  return {
    categories: (a.data || []) as Taxonomy[],
    collections: (b.data || []) as Taxonomy[],
  };
}
export function imageURL(path: string) {
  return path.startsWith('/')
    ? path
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`;
}
export async function settings() {
  if (!configured()) return null;
  const { data } = await publicDB()
    .from('store_settings')
    .select('*')
    .eq('id', true)
    .single();
  return data;
}
