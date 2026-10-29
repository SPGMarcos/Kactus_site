import { identity, adminDB } from '@/lib/supabase';
import { checkoutSchema } from '@/lib/validation';
import { checkOrigin, apiError } from '@/lib/http';
import { ensureSession, stripeClient } from '@/lib/payments';
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await identity();
    if (!user) return apiError(new Error('Faça login para continuar.'), 401);
    stripeClient();
    const input = checkoutSchema.parse(await request.json());
    const db = adminDB();
    const { data: setting } = await db
      .from('store_settings')
      .select('test_pickup')
      .eq('id', true)
      .single();
    if (!setting?.test_pickup || process.env.APP_ENV === 'production')
      throw new Error(
        'Modalidade de entrega precisa ser configurada antes de operar.',
      );
    const { data: id, error } = await db.rpc('reserve_order', {
      p_user: user.id,
      p_key: input.key,
      p_items: input.items,
    });
    if (error) throw new Error(error.message);
    const s = await ensureSession(id);
    if (s.status !== 'open' || !s.url)
      throw new Error('Checkout encerrado. Consulte seus pedidos.');
    return Response.json({ url: s.url, order: id });
  } catch (e) {
    return apiError(e);
  }
}
