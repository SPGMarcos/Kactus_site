alter table public.variants add column available integer generated always as (stock-reserved) stored;
grant select(available) on public.variants to anon,authenticated;
create or replace function public.catalog_variants(p_product uuid) returns table(id uuid,sku text,size text,color text,available integer) language sql security invoker set search_path='' as $$ select v.id,v.sku,v.size,v.color,v.available from public.variants v join public.products p on p.id=v.product_id where p.id=p_product and p.status='active' $$;
create function public.search_catalog(p_query text default '',p_category uuid default null,p_collection uuid default null,p_size text default '',p_color text default '',p_available boolean default false,p_featured boolean default false,p_sort text default 'new',p_page integer default 1) returns jsonb language sql stable security invoker set search_path='' as $$
 with matches as (select p.* from public.products p where p.status='active' and (p_query='' or p.name ilike '%'||replace(replace(p_query,'%',''), '_','')||'%') and (p_category is null or p.category_id=p_category) and (p_collection is null or p.collection_id=p_collection) and (not p_featured or p.featured) and ((p_size='' and p_color='' and not p_available) or exists(select 1 from public.variants v where v.product_id=p.id and (p_size='' or v.size=p_size) and (p_color='' or lower(v.color)=lower(p_color)) and (not p_available or v.available>0)))), page as (select * from matches order by case when p_sort='price-asc' then price end asc,case when p_sort='price-desc' then price end desc,created_at desc,id limit 12 offset (greatest(1,least(p_page,10000))-1)*12)
 select jsonb_build_object('count',(select count(*) from matches),'products',coalesce((select jsonb_agg(to_jsonb(p)||jsonb_build_object('product_images',coalesce((select jsonb_agg(jsonb_build_object('path',i.path,'alt',i.alt,'position',i.position) order by i.position) from public.product_images i where i.product_id=p.id),'[]'::jsonb))) from page p),'[]'::jsonb));
$$;
revoke all on function public.search_catalog(text,uuid,uuid,text,text,boolean,boolean,text,integer) from public;
grant execute on function public.search_catalog(text,uuid,uuid,text,text,boolean,boolean,text,integer) to anon,authenticated,service_role;

create function public.finance_report(p_from timestamptz,p_to timestamptz) returns jsonb language sql stable set search_path='' as $$
 with o as (select * from public.orders where created_at>=p_from and created_at<p_to), paid as (select * from o where payment_status in ('paid','partially_refunded','refunded')), totals as (select coalesce(sum(subtotal),0) revenue,coalesce(sum(discount),0) discounts,coalesce(sum(shipping),0) shipping,coalesce(sum(total),0) gross,coalesce(sum(refunded),0) refunds from paid), costs as(select coalesce(sum(i.cost*i.quantity),0) known_cost,count(*) filter(where i.cost is null) unknown_cost_items from public.order_items i join paid on paid.id=i.order_id), fees as(select coalesce(sum(p.fee),0) fees,count(*) filter(where p.fee is null) unknown_fees,coalesce(sum(p.amount) filter(where p.reconciled),0) reconciled from public.payments p join paid on paid.id=p.order_id), expenses as(select coalesce(sum(amount),0) expenses from public.expenses where incurred_on>=(p_from at time zone 'America/Sao_Paulo')::date and incurred_on<(p_to at time zone 'America/Sao_Paulo')::date)
 select to_jsonb(t)||to_jsonb(c)||to_jsonb(f)||to_jsonb(e)||jsonb_build_object('estimated_result',t.gross-t.refunds-c.known_cost-f.fees-e.expenses,'pending_orders',(select count(*) from o where payment_status='pending'),'pending_amount',(select coalesce(sum(total),0) from o where payment_status='pending'),'low_stock',(select count(*) from public.variants where available between 1 and 3),'out_of_stock',(select count(*) from public.variants where available=0),'order_count',(select count(*) from o)) from totals t,costs c,fees f,expenses e;
$$;
revoke all on function public.finance_report(timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.finance_report(timestamptz,timestamptz) to service_role;

create function public.release_uncreated_order(p_order uuid) returns void language plpgsql set search_path='' as $$
declare o public.orders;r public.reservations;itm record;
begin
 select * into o from public.orders where id=p_order for update;
 if o.payment_status<>'pending' or o.stripe_session_id is not null or now()<o.expires_at+interval '5 minutes' then raise exception 'Não é seguro liberar esta reserva';end if;
 select * into r from public.reservations where order_id=p_order for update;
 if r.state<>'active' then return;end if;
 for itm in select * from public.reservation_items where reservation_id=r.id order by variant_id loop update public.variants set reserved=reserved-itm.quantity where id=itm.variant_id;end loop;
 update public.reservations set state='released' where id=r.id;
 update public.orders set payment_status='expired' where id=p_order;
 insert into public.audit_log(entity,entity_id,operation,reason) values('orders',p_order::text,'release','Consulta exaustiva Stripe sem sessão após prazo de criação e margem de 5 minutos');
end $$;
revoke all on function public.release_uncreated_order(uuid) from public,anon,authenticated;
grant execute on function public.release_uncreated_order(uuid) to service_role;
