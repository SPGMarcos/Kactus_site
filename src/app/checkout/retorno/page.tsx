import Link from 'next/link';
import { identity, sessionDB } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
export default async function Return({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const user = await identity();
  let status = 'pending';
  if (user && order) {
    const { data } = await (
      await sessionDB()
    )
      .from('orders')
      .select('payment_status')
      .eq('id', order)
      .eq('user_id', user.id)
      .maybeSingle();
    status = data?.payment_status || 'pending';
  }
  const paid = ['paid', 'partially_refunded', 'refunded'].includes(status);
  return (
    <section className="section">
      <div className="empty-state">
        <span>{paid ? '✓' : '◷'}</span>
        <p className="eyebrow">SEU PEDIDO NA KACTUS</p>
        <h1>
          {paid
            ? 'Pagamento confirmado.'
            : status === 'expired'
              ? 'Checkout expirado.'
              : 'Pagamento em processamento.'}
        </h1>
        <p>
          {paid
            ? 'A confirmação foi recebida pelo servidor. Acompanhe o atendimento na sua conta.'
            : 'Aguarde a confirmação segura. Abrir esta página não confirma o pagamento.'}
        </p>
        <Link className="button" href="/conta">
          Acompanhar meus pedidos
        </Link>
        <a
          className="text-link"
          style={{ marginTop: 20 }}
          href={`/checkout/retorno?order=${encodeURIComponent(order || '')}`}
        >
          Atualizar status
        </a>
      </div>
    </section>
  );
}
