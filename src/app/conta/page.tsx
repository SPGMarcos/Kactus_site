import Link from 'next/link';
import { UserRound, ArrowUpRight } from 'lucide-react';
import { identity, sessionDB } from '@/lib/supabase';
import { money, date } from '@/lib/utils';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Minha conta' };
export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; page?: string }>;
}) {
  const params = await searchParams;
  const user = await identity();
  if (!user)
    return (
      <section className="section">
        <div className="breadcrumb">
          <Link href="/">Início</Link> / Minha conta
        </div>
        <div className="account-panel">
          <UserRound size={28} style={{ margin: '0 auto 25px' }} />
          <p className="eyebrow" style={{ justifyContent: 'center' }}>
            SEU ESPAÇO NA KACTUS
          </p>
          <h1>
            Bem-vindo ao
            <br />
            seu próximo estilo.
          </h1>
          <p>
            Entre para acompanhar seus pedidos e continuar suas compras. Seu
            carrinho fica guardado.
          </p>
          <a className="button full" href="/auth/login">
            Entrar com Google <ArrowUpRight size={18} />
          </a>
          {params.error && (
            <p role="alert" className="error">
              Não foi possível entrar. A configuração Google OAuth precisa estar
              ativa no Supabase.
            </p>
          )}
          <small className="muted">
            Ao entrar, consulte nossa{' '}
            <Link href="/politicas/privacidade">política de privacidade</Link>.
          </small>
        </div>
      </section>
    );
  const db = await sessionDB();
  const page = Math.max(1, Number(params.page) || 1);
  const { data: orders, count } = await db
    .from('orders')
    .select('id,created_at,total,payment_status,fulfillment_status', {
      count: 'exact',
    })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * 20, page * 20 - 1);
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MINHA CONTA</p>
          <h1>
            Olá, {user.user_metadata?.full_name?.split(' ')[0] || 'bem-vindo'}.
          </h1>
          <p>{user.email}</p>
        </div>
        <form action="/auth/logout" method="post">
          <button className="button button-outline">Sair da conta</button>
        </form>
      </div>
      <h2>Seus pedidos</h2>
      {orders?.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Data</th>
                <th>Total</th>
                <th>Pagamento</th>
                <th>Atendimento</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/conta/pedidos/${o.id}`}>
                      #{o.id.slice(0, 8)} ↗
                    </Link>
                  </td>
                  <td>{date(o.created_at)}</td>
                  <td>{money(o.total)}</td>
                  <td>{o.payment_status}</td>
                  <td>{o.fulfillment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>Sua história com a Kactus começa aqui.</h3>
          <Link className="button" href="/loja">
            Explorar a loja
          </Link>
        </div>
      )}
      {(count || 0) > page * 20 && (
        <Link href={`/conta?page=${page + 1}`}>Próxima página →</Link>
      )}
    </section>
  );
}
