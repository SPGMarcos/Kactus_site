import 'server-only';
import Stripe from 'stripe';
import { adminDB } from './supabase';
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Pagamento de teste ainda não configurado.');
  if (process.env.APP_ENV !== 'production' && !/^(sk|rk)_test_/.test(key))
    throw new Error('Use uma chave Stripe de testes.');
  return new Stripe(key);
}
export async function ensureSession(orderId: string) {
  const db = adminDB();
  const stripe = stripeClient();
  const { data: o, error } = await db
    .from('orders')
    .select('*,order_items(*)')
    .eq('id', orderId)
    .single();
  if (error || !o) throw new Error('Pedido não encontrado');
  if (o.stripe_session_id)
    return stripe.checkout.sessions.retrieve(o.stripe_session_id);
  if (o.payment_status !== 'pending')
    throw new Error('Pedido não está pendente');
  // Search recent sessions to recover a successful creation whose DB update was lost.
  if (Date.now() - new Date(o.created_at).getTime() > 25 * 60 * 1000) {
    let found: Stripe.Checkout.Session | undefined;
    for await (const s of stripe.checkout.sessions.list({
      created: { gte: Math.floor(new Date(o.created_at).getTime() / 1000) - 5 },
      limit: 100,
    })) {
      if (s.metadata?.order_id === o.id) {
        found = s;
        break;
      }
    }
    if (found) {
      const { error: e } = await db
        .from('orders')
        .update({ stripe_session_id: found.id })
        .eq('id', o.id);
      if (e) throw e;
      return found;
    }
    if (Date.now() > new Date(o.expires_at).getTime() + 5 * 60 * 1000) {
      const { error: e } = await db.rpc('release_uncreated_order', {
        p_order: o.id,
      });
      if (e) throw new Error(e.message);
      throw new Error(
        'Reserva sem sessão expirada e liberada. Inicie uma nova tentativa.',
      );
    }
    throw new Error(
      'Reserva pendente exige recuperação administrativa; nenhum estoque foi liberado.',
    );
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      allowed_payment_method_types: ['card'],
      integration_identifier: 'kactus-stylish-mqxdnatr',
      client_reference_id: o.id,
      metadata: { order_id: o.id },
      expires_at: Math.floor(new Date(o.expires_at).getTime() / 1000),
      success_url: `${base}/checkout/retorno?order=${o.id}`,
      cancel_url: `${base}/checkout/cancelado?order=${o.id}`,
      line_items: o.order_items.map(
        (i: {
          name: string;
          size: string;
          color: string;
          quantity: number;
          unit_price: number;
        }) => ({
          price_data: {
            currency: 'brl',
            unit_amount: i.unit_price,
            product_data: { name: `${i.name} · ${i.size} · ${i.color}` },
          },
          quantity: i.quantity,
        }),
      ),
    },
    { idempotencyKey: `checkout:${o.id}` },
  );
  const { error: e } = await db
    .from('orders')
    .update({ stripe_session_id: session.id })
    .eq('id', o.id);
  if (e)
    throw new Error(
      'Sessão criada, aguardando reconciliação. Tente novamente com o mesmo carrinho.',
    );
  return session;
}
export async function settle(
  session: Stripe.Checkout.Session,
  eventId: string,
  type: string,
) {
  if (session.livemode && process.env.APP_ENV !== 'production')
    throw new Error('Evento de produção rejeitado');
  if (!session.metadata?.order_id) throw new Error('Pedido ausente');
  const state =
    session.payment_status === 'paid'
      ? 'paid'
      : session.status === 'expired'
        ? 'expired'
        : 'pending';
  const { error } = await adminDB().rpc('settle_order', {
    p_order: session.metadata.order_id,
    p_session: session.id,
    p_state: state,
    p_amount: session.amount_total,
    p_currency: session.currency,
    p_intent:
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null,
    p_event: eventId,
    p_type: type,
  });
  if (error) throw new Error(error.message);
}
