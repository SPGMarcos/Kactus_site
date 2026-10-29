import { notFound } from 'next/navigation';
import Link from 'next/link';
import { publicDB, configured } from '@/lib/supabase';
import { variants, imageURL, settings, type Product } from '@/lib/catalog';
import { ProductDetail } from '@/components/product-detail';
export const dynamic = 'force-dynamic';
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!configured()) notFound();
  const { slug } = await params;
  const { data } = await publicDB()
    .from('products')
    .select('*,product_images(path,alt,position)')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();
  if (!data) notFound();
  const p = data as Product;
  const [v, s] = await Promise.all([variants(p.id), settings()]);
  return (
    <section className="section">
      <div className="breadcrumb">
        <Link href="/">Início</Link> / <Link href="/loja">Loja</Link> / {p.name}
      </div>
      <ProductDetail
        product={p}
        variants={v}
        images={[...p.product_images]
          .sort((a, b) => a.position - b.position)
          .map((i) => ({ url: imageURL(i.path), alt: i.alt }))}
        delivery={s?.delivery_policy || 'Rascunho: a definir.'}
        returns={s?.returns_policy || 'Rascunho: a definir.'}
      />
    </section>
  );
}
