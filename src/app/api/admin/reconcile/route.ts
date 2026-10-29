import { adminDB, requireAdmin } from '@/lib/supabase';
import { checkOrigin, apiError } from '@/lib/http';
import { ensureSession, settle } from '@/lib/payments';
import { reconcileFinance } from '@/lib/reconcile-finance';
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await requireAdmin();
    const { data, error } = await adminDB()
      .from('orders')
      .select('id')
      .eq('payment_status', 'pending')
      .order('created_at')
      .limit(25);
    if (error) throw error;
    const results = [];
    for (const order of data || []) {
      try {
        const s = await ensureSession(order.id);
        await settle(
          s,
          `reconcile:${s.id}:${s.status}:${s.payment_status}`,
          'manual_reconciliation',
        );
        results.push({ id: order.id, status: s.status });
      } catch (e) {
        results.push({
          id: order.id,
          error: e instanceof Error ? e.message : 'Falha',
        });
      }
    }
    const {data:payments}=await adminDB().from('payments').select('order_id').eq('reconciled',false).order('created_at').limit(25);
    for(const p of payments||[]){try{await reconcileFinance(p.order_id);}catch(e){results.push({id:p.order_id,error:e instanceof Error?e.message:'Falha de conciliação financeira'});}}
    return Response.json({ results });
  } catch (e) {
    return apiError(e);
  }
}
