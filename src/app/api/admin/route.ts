import { z } from 'zod';
import { adminDB, requireAdmin } from '@/lib/supabase';
import { checkOrigin, apiError } from '@/lib/http';
import { entitySchemas, settingsSchema } from '@/lib/admin';
import { stockSchema } from '@/lib/validation';
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const entity = url.searchParams.get('entity') || 'products';
    if (
      ![
        'products',
        'variants',
        'categories',
        'collections',
        'orders',
        'order_items',
        'order_delivery',
        'expenses',
        'audit_log',
        'stock_movements',
        'payments',
        'refunds',
        'store_settings',
        'product_images',
      ].includes(entity)
    )
      throw new Error('Consulta inválida');
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    let q = adminDB().from(entity).select('*', { count: 'exact' });
    if (
      [
        'orders',
        'audit_log',
        'expenses',
        'payments',
        'stock_movements',
      ].includes(entity)
    )
      q = q.order('created_at', { ascending: false });
    if (
      url.searchParams.get('from') &&
      ['orders', 'payments', 'expenses'].includes(entity)
    )
      q = q.gte('created_at', url.searchParams.get('from')!);
    if (
      url.searchParams.get('to') &&
      ['orders', 'payments', 'expenses'].includes(entity)
    )
      q = q.lt('created_at', url.searchParams.get('to')!);
    if (
      url.searchParams.get('order') &&
      ['order_items', 'order_delivery', 'refunds'].includes(entity)
    )
      q = q.eq('order_id', url.searchParams.get('order')!);
    const { data, error, count } = await q.range(
      (page - 1) * 50,
      page * 50 - 1,
    );
    if (error) throw new Error(error.message);
    return Response.json({ data, count });
  } catch (e) {
    return apiError(e, 403);
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const actor = await requireAdmin();
    const body = z
      .object({
        entity: z.string(),
        id: z.uuid().nullable().optional(),
        data: z.unknown(),
      })
      .parse(await request.json());
    const db = adminDB();
    if (body.entity === 'stock') {
      const data = stockSchema.parse(body.data);
      const { error } = await db.rpc('adjust_stock', {
        p_actor: actor.id,
        p_variant: data.variant_id,
        p_delta: data.delta,
        p_reason: data.reason,
      });
      if (error) throw new Error(error.message);
      return Response.json({ ok: true });
    }
    if (body.entity === 'settings') {
      const data = settingsSchema.parse(body.data);
      const { error } = await db.rpc('update_store_settings', {
        p_actor: actor.id,
        p_data: data,
      });
      if (error) throw new Error(error.message);
      return Response.json({ ok: true });
    }
    const schema = entitySchemas[body.entity as keyof typeof entitySchemas];
    if (!schema) throw new Error('Entidade inválida');
    const data = schema.parse(body.data);
    const { data: id, error } = await db.rpc('admin_mutate', {
      p_actor: actor.id,
      p_entity: body.entity,
      p_id: body.id || null,
      p_data: data,
    });
    if (error) throw new Error(error.message);
    return Response.json({ id });
  } catch (e) {
    return apiError(e);
  }
}
