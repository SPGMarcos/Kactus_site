import { notFound, redirect } from 'next/navigation';
import { identity, sessionDB } from '@/lib/supabase';
import { money, date } from '@/lib/utils';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export default async function Order({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await identity();
  if (!user) redirect('/conta');
  const { id } = await params;
  const db = await sessionDB();
  const { data: o } = await db
    .from('orders')
    .select(
      '*,order_items(id,name,size,color,quantity,unit_price,discount),order_delivery(*)',
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!o) notFound();
  return (
    <section className="section">
      <Link className="text-link" href="/conta">
        ← Minha conta
      </Link>
      <h1 style={{ marginTop: 30 }}>Pedido #{o.id.slice(0, 8)}</h1>
      <p>{date(o.created_at)}</p>
      <p>
        Pagamento: <strong>{o.payment_status}</strong> · Atendimento:{' '}
        <strong>{o.fulfillment_status}</strong>
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Peça</th>
              <th>Variação</th>
              <th>Quantidade</th>
              <th>Valor unitário</th>
            </tr>
          </thead>
          <tbody>
            {o.order_items.map(
              (i: {
                id: string;
                name: string;
                size: string;
                color: string;
                quantity: number;
                unit_price: number;
              }) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td>
                    {i.size} / {i.color}
                  </td>
                  <td>{i.quantity}</td>
                  <td>{money(i.unit_price)}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <h2 style={{ marginTop: 30 }}>Total {money(o.total)}</h2>
      <p>
        Modalidade: retirada de teste.{' '}
        {o.order_delivery?.tracking &&
          `Rastreamento: ${o.order_delivery.tracking}`}
      </p>
    </section>
  );
}
