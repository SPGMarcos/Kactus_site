import { requireAdmin, adminDB } from '@/lib/supabase';
import { apiError } from '@/lib/http';
import { z } from 'zod';
import { csvCell } from '@/lib/utils';
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const from = z.iso
      .date()
      .parse(url.searchParams.get('from') || '2020-01-01');
    const to = z.iso
      .date()
      .parse(
        url.searchParams.get('to') || new Date().toISOString().slice(0, 10),
      );
    const end = new Date(`${to}T00:00:00-03:00`);
    end.setUTCDate(end.getUTCDate() + 1);
    const start = `${from}T00:00:00-03:00`;
    if (new Date(start) >= end) throw new Error('Período inválido');
    const db = adminDB();
    if (url.searchParams.get('format') === 'csv') {
      const encoder = new TextEncoder();
      const columns = [
        'id',
        'created_at',
        'subtotal',
        'discount',
        'shipping',
        'total',
        'refunded',
        'payment_status',
        'fulfillment_status',
      ];
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(
            encoder.encode('\ufeff' + columns.join(',') + '\r\n'),
          );
          let offset = 0;
          try {
            while (true) {
              const { data, error } = await db
                .from('orders')
                .select(columns.join(','))
                .gte('created_at', start)
                .lt('created_at', end.toISOString())
                .order('created_at')
                .order('id')
                .range(offset, offset + 499);
              if (error) throw error;
              for (const row of (data || []) as unknown as Record<
                string,
                unknown
              >[])
                controller.enqueue(
                  encoder.encode(
                    columns.map((k) => csvCell(row[k])).join(',') + '\r\n',
                  ),
                );
              if (!data || data.length < 500) break;
              offset += 500;
            }
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        },
      });
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="kactus-financas.csv"',
          'Cache-Control': 'no-store',
        },
      });
    }
    const { data, error } = await db.rpc('finance_report', {
      p_from: start,
      p_to: end.toISOString(),
    });
    if (error) throw new Error(error.message);
    return Response.json(data);
  } catch (e) {
    return apiError(e, 403);
  }
}
