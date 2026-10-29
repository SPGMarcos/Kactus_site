import { stripeClient, settle } from '@/lib/payments';
import { reconcileFinance } from '@/lib/reconcile-finance';
import { adminDB } from '@/lib/supabase';
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET)
    return Response.json({ error: 'Assinatura ausente' }, { status: 400 });
  const stripe = stripeClient();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return Response.json({ error: 'Assinatura inválida' }, { status: 400 });
  }
  try {
    if (
      [
        'checkout.session.completed',
        'checkout.session.expired',
        'checkout.session.async_payment_succeeded',
        'checkout.session.async_payment_failed',
      ].includes(event.type)
    ) {
      const data = event.data.object as { id: string };
      const session = await stripe.checkout.sessions.retrieve(data.id);
      await settle(session, event.id, event.type);
      if(session.payment_status==='paid' && session.metadata?.order_id)await reconcileFinance(session.metadata.order_id);
    }
    if(['refund.created','refund.updated','refund.failed','charge.refunded'].includes(event.type)){
      const object=event.data.object as {payment_intent?:string|null};
      if(object.payment_intent){const {data:o}=await adminDB().from('orders').select('id').eq('stripe_payment_intent',object.payment_intent).maybeSingle();if(o)await reconcileFinance(o.id);}
    }
    return Response.json({ received: true });
  } catch {
    return Response.json(
      { error: 'Processamento pendente; tente novamente.' },
      { status: 500 },
    );
  }
}
