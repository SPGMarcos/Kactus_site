import 'server-only';
import { adminDB } from './supabase';
import { stripeClient } from './payments';
export async function reconcileFinance(orderId:string){
 const db=adminDB();const stripe=stripeClient();const {data:o,error}=await db.from('orders').select('id,stripe_payment_intent').eq('id',orderId).single();if(error||!o?.stripe_payment_intent)return;
 const intent=await stripe.paymentIntents.retrieve(o.stripe_payment_intent,{expand:['latest_charge.balance_transaction']});
 const charge=typeof intent.latest_charge==='object'?intent.latest_charge:null;
 const balance=typeof charge?.balance_transaction==='object'?charge.balance_transaction:null;
 if(balance){const {error:e}=await db.from('payments').update({fee:balance.fee,reconciled:true}).eq('order_id',o.id);if(e)throw new Error(e.message);}
 const refunds=[];for await(const refund of stripe.refunds.list({payment_intent:o.stripe_payment_intent,limit:100}))refunds.push(refund);
 const total=refunds.filter(r=>r.status==='succeeded').reduce((n,r)=>n+r.amount,0);
 for(const r of refunds){const {error:e}=await db.rpc('record_refund',{p_order:o.id,p_refund:r.id,p_amount:r.amount,p_status:r.status,p_total_refunded:total,p_actor:null});if(e)throw new Error(e.message);}
}
