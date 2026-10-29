import { z } from 'zod';
import { requireAdmin, adminDB } from '@/lib/supabase';
import { checkOrigin, apiError } from '@/lib/http';
import { stripeClient, ensureSession, settle } from '@/lib/payments';
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const actor = await requireAdmin();
    const { order_id, action } = z
      .object({
        order_id: z.uuid(),
        action: z.enum(['cancel', 'refund']),
        confirmed: z.literal(true),
      })
      .parse(await request.json());
    const db = adminDB();
    const stripe = stripeClient();
    const { data: o, error } = await db
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();
    if (error) throw new Error('Pedido não encontrado');
    if (action === 'cancel') {
      const s = await ensureSession(o.id);
      const current =
        s.status === 'open' ? await stripe.checkout.sessions.expire(s.id) : s;
      await settle(
        current,
        `cancel:${current.id}:${current.status}`,
        'admin_cancel',
      );
      return Response.json({ ok: true });
    }
    if (
      !o.stripe_payment_intent ||
      !['paid', 'partially_refunded', 'refunded'].includes(o.payment_status)
    )
      throw new Error('Pedido sem pagamento confirmado');
    const refund = await stripe.refunds.create(
      { payment_intent: o.stripe_payment_intent },
      { idempotencyKey: `refund-full:${o.id}` },
    );
    const intent = await stripe.paymentIntents.retrieve(
      o.stripe_payment_intent,
      { expand: ['latest_charge'] },
    );
    const charge =
      typeof intent.latest_charge === 'object' ? intent.latest_charge : null;
    const { error: e } = await db.rpc('record_refund', {
      p_order: o.id,
      p_refund: refund.id,
      p_amount: refund.amount,
      p_status: refund.status,
      p_total_refunded: charge?.amount_refunded || 0,
      p_actor: actor.id,
    });
    if (e)
      throw new Error(
        'Reembolso solicitado; conciliação pendente. Repita a mesma ação com segurança.',
      );
    return Response.json({ status: refund.status });
  } catch (e) {
    return apiError(e);
  }
}
