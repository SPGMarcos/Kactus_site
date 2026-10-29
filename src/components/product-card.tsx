import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { imageURL, type Product } from '@/lib/catalog';
import { money } from '@/lib/utils';
export function ProductCard({ product: p }: { product: Product }) {
  const image = [...p.product_images].sort(
    (a, b) => a.position - b.position,
  )[0];
  return (
    <Link className="product-card" href={`/produto/${p.slug}`}>
      <div className="product-picture">
        {image ? (
          <img loading="lazy" src={imageURL(image.path)} alt={image.alt} />
        ) : (
          <span>Foto em breve</span>
        )}
        <span className="product-arrow">
          <ArrowUpRight size={19} />
        </span>
      </div>
      <div className="product-caption">
        <h3>{p.name}</h3>
        <p>{money(p.price)}</p>
      </div>
      <span className="muted">Veja tamanhos e cores</span>
    </Link>
  );
}
