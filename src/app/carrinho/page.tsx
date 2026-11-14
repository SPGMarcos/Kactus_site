'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingBag, Trash2, ArrowRight, LockKeyhole } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { money } from '@/lib/utils';
export default function Cart() {
  const { items, update, ready } = useCart();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function checkout() {
    setBusy(true);
    setError('');
    try {
      const input = items
        .map((i) => ({ variant_id: i.variant_id, quantity: i.quantity }))
        .sort((a, b) => a.variant_id.localeCompare(b.variant_id));
      const fingerprint = JSON.stringify(input);
      let attempt;
      try {
        attempt = JSON.parse(localStorage.getItem('kactus-checkout') || 'null');
      } catch {}
      if (!attempt || attempt.fingerprint !== fingerprint) {
        attempt = { key: crypto.randomUUID(), fingerprint };
        localStorage.setItem('kactus-checkout', JSON.stringify(attempt));
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: attempt.key, items: input }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.assign(new URL('/auth/login?next=/carrinho',window.location.origin));
        return;
      }
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao iniciar pagamento.');
      setBusy(false);
    }
  }
  return (
    <section className="section cart-page">
      <div className="breadcrumb">
        <Link href="/">Início</Link> / Carrinho
      </div>
      <h1>Seu carrinho.</h1>
      {!ready ? (
        <p>Carregando carrinho…</p>
      ) : !items.length ? (
        <div className="empty-state">
          <ShoppingBag size={42} />
          <h2>Seu carrinho está vazio.</h2>
          <Link className="button" href="/loja">
            Explorar a loja <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {items.map((i) => (
              <article className="cart-item" key={i.variant_id}>
                {i.image && <img src={i.image} alt={i.name} />}
                <div>
                  <h3>{i.name}</h3>
                  <p>
                    {i.size} · {i.color}
                  </p>
                  <strong>{money(i.price)}</strong>
                </div>
                <label>
                  Quantidade
                  <input
                    aria-label={`Quantidade de ${i.name}`}
                    type="number"
                    min="1"
                    max="20"
                    value={i.quantity}
                    onChange={(e) =>
                      update(i.variant_id, Number(e.target.value))
                    }
                  />
                </label>
                <button
                  className="icon-button"
                  aria-label={`Remover ${i.name}`}
                  onClick={() => update(i.variant_id, 0)}
                >
                  <Trash2 size={19} />
                </button>
              </article>
            ))}
          </div>
          <aside className="cart-summary">
            <h2>Resumo do pedido</h2>
            <div>
              <span>Subtotal estimado</span>
              <strong>
                {money(items.reduce((n, i) => n + i.price * i.quantity, 0))}
              </strong>
            </div>
            <p>
              Nesta compra de teste, a retirada é na loja. Vamos conferir o preço e o estoque antes do pagamento.
            </p>
            <button className="button full" disabled={busy} onClick={checkout}>
              {busy ? 'Abrindo pagamento…' : 'Continuar para pagamento'}{' '}
              <ArrowRight size={18} />
            </button>
            <small>
              <LockKeyhole size={14} /> Pagamento em ambiente de testes Stripe
            </small>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
