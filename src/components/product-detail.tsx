'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { type Product, type Variant } from '@/lib/catalog';
import { money } from '@/lib/utils';
import { useCart } from './cart-provider';
export function ProductDetail({
  product: p,
  variants,
  images,
  delivery,
  returns,
}: {
  product: Product;
  variants: Variant[];
  images: { url: string; alt: string }[];
  delivery: string;
  returns: string;
}) {
  const [selected, setSelected] = useState('');
  const [photo, setPhoto] = useState(0);
  const [added, setAdded] = useState(false);
  const cart = useCart();
  const router = useRouter();
  const variant = variants.find((v) => v.id === selected);
  function add(buy = false) {
    if (!variant || variant.available < 1) return;
    cart.add({
      variant_id: variant.id,
      name: p.name,
      size: variant.size,
      color: variant.color,
      price: p.price,
      image: images[0]?.url || '',
      quantity: 1,
    });
    setAdded(true);
    if (buy) router.push('/carrinho');
  }
  return (
    <div className="product-detail">
      <div>
        <div className="detail-image">
          {images[photo] ? (
            <img src={images[photo].url} alt={images[photo].alt} />
          ) : (
            <span>Foto em breve</span>
          )}
        </div>
        <div className="thumbnails">
          {images.map((i, n) => (
            <button
              key={i.url}
              onClick={() => setPhoto(n)}
              aria-label={`Ver foto ${n + 1}`}
              aria-pressed={photo === n}
            >
              <img src={i.url} alt={i.alt} />
            </button>
          ))}
        </div>
      </div>
      <div className="detail-copy">
        <p className="eyebrow">SELEÇÃO KACTUS</p>
        <h1>{p.name}</h1>
        <p className="detail-price">{money(p.price)}</p>
        <p>{p.description}</p>
        <label htmlFor="variation">Escolha tamanho e cor</label>
        <select
          id="variation"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setAdded(false);
          }}
        >
          <option value="">Selecione uma opção</option>
          {variants.map((v) => (
            <option key={v.id} value={v.id} disabled={v.available === 0}>
              {v.size} · {v.color}
              {v.available === 0 ? ' — esgotado' : ''}
            </option>
          ))}
        </select>
        <p className="muted">
          {variant
            ? variant.available > 0
              ? 'Disponível nesta variação.'
              : 'Variação esgotada.'
            : 'Selecione para consultar disponibilidade.'}
        </p>
        <button
          className="button full"
          disabled={!variant || variant.available < 1}
          onClick={() => add()}
        >
          {added ? <Check size={18} /> : <ShoppingBag size={18} />}{' '}
          {added ? 'Adicionado ao carrinho' : 'Adicionar ao carrinho'}
        </button>
        <button
          className="button button-outline full"
          disabled={!variant || variant.available < 1}
          onClick={() => add(true)}
        >
          Comprar agora <ArrowRight size={18} />
        </button>
        <div aria-live="polite">
          {added && (
            <p>
              Peça adicionada. <a href="/carrinho">Ver carrinho →</a>
            </p>
          )}
        </div>
        <details>
          <summary>Entrega e retirada</summary>
          <p>{delivery}</p>
        </details>
        <details>
          <summary>Trocas e devoluções</summary>
          <p>{returns}</p>
        </details>
      </div>
    </div>
  );
}
