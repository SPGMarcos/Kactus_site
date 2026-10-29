create schema if not exists private;
create table public.profiles (id uuid primary key references auth.users on delete cascade, display_name text, created_at timestamptz not null default now());
create table public.user_roles (user_id uuid primary key references auth.users on delete cascade, role text not null check(role='admin'));
create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.user_roles where user_id=auth.uid() and role='admin') $$;
grant usage on schema private to authenticated;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;
create table public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique);
create table public.collections (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, month date, active boolean not null default true);
create table public.products (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, description text not null default '', category_id uuid references public.categories, collection_id uuid references public.collections, price integer not null check(price>0), status text not null default 'draft' check(status in ('draft','active','archived')), featured boolean not null default false, created_at timestamptz not null default now());
create table public.variants (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products, sku text not null unique, size text not null, color text not null, stock integer not null default 0 check(stock>=0), reserved integer not null default 0 check(reserved>=0 and reserved<=stock), cost integer check(cost>=0), unique(product_id,size,color));
create table public.product_images (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products, path text not null, alt text not null, position integer not null default 0);
create table public.orders (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users, request_key uuid not null, cart_hash text not null, payment_status text not null default 'pending' check(payment_status in ('pending','paid','expired','partially_refunded','refunded')), fulfillment_status text not null default 'pending' check(fulfillment_status in ('pending','preparing','shipped','ready','completed','cancelled')), subtotal integer not null default 0 check(subtotal>=0), discount integer not null default 0 check(discount>=0), shipping integer not null default 0 check(shipping>=0), total integer not null default 0 check(total>=0), stripe_session_id text unique, stripe_payment_intent text unique, refunded integer not null default 0 check(refunded>=0 and refunded<=total), created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '60 minutes', unique(user_id,request_key));
create table public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders, variant_id uuid not null references public.variants, name text not null, sku text not null, size text not null, color text not null, quantity integer not null check(quantity>0), unit_price integer not null check(unit_price>0), cost integer check(cost>=0), discount integer not null default 0 check(discount>=0));
create table public.order_delivery (order_id uuid primary key references public.orders, method text not null default 'test_pickup', address jsonb, tracking text);
create table public.reservations (id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders, state text not null default 'active' check(state in ('active','consumed','released')), expires_at timestamptz not null);
create table public.reservation_items (reservation_id uuid references public.reservations, variant_id uuid references public.variants, quantity integer not null check(quantity>0), primary key(reservation_id,variant_id));
create table public.stock_movements (id bigint generated always as identity primary key, variant_id uuid not null references public.variants, delta integer not null, reason text not null, order_id uuid references public.orders, actor_id uuid references auth.users, created_at timestamptz not null default now());
create table public.payments (id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders, stripe_payment_intent text unique, amount integer not null check(amount>=0), fee integer check(fee>=0), reconciled boolean not null default false, created_at timestamptz not null default now());
create table public.stripe_events (id text primary key, type text not null, processed_at timestamptz not null default now());
create table public.refunds (id text primary key, order_id uuid not null references public.orders, amount integer not null check(amount>0), status text not null, created_at timestamptz not null default now());
create table public.expenses (id uuid primary key default gen_random_uuid(), description text not null, amount integer not null check(amount>0), incurred_on date not null, created_at timestamptz not null default now());
create table public.audit_log (id bigint generated always as identity primary key, actor_id uuid, entity text not null, entity_id text, operation text not null, before_data jsonb, after_data jsonb, reason text, created_at timestamptz not null default now());
create table public.store_settings (id boolean primary key default true check(id), instagram text not null default 'https://www.instagram.com/kactus_stylish_01/', whatsapp text, address text, delivery_policy text not null default 'Rascunho: entrega e retirada aguardam definição.', returns_policy text not null default 'Rascunho: política de trocas aguardando revisão.', privacy_policy text not null default 'Rascunho: política de privacidade aguardando revisão.', test_pickup boolean not null default true);
insert into public.store_settings default values;
create index on public.products(category_id,status);
create index on public.products(collection_id);
create index on public.variants(product_id);
create index on public.product_images(product_id,position);
create index on public.orders(user_id,created_at desc);
create index on public.orders(payment_status,created_at);
create index on public.order_items(order_id);
create index on public.stock_movements(variant_id,created_at desc);
create index on public.audit_log(created_at desc);
create index on public.reservations(state,expires_at);

-- Default deny. Public catalog has no access to internal cost/stock columns.
do $$ declare t text; begin
 foreach t in array array['profiles','user_roles','categories','collections','products','variants','product_images','orders','order_items','order_delivery','reservations','reservation_items','stock_movements','payments','stripe_events','refunds','expenses','audit_log','store_settings'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 execute format('create policy admin_read on public.%I for select to authenticated using (private.is_admin())',t);
 end loop;
end $$;
grant select on public.categories,public.collections,public.products,public.product_images,public.store_settings to anon,authenticated;
create policy public_read on public.categories for select using(true);
create policy public_read on public.collections for select using(active);
create policy public_read on public.products for select using(status='active');
create policy public_read on public.product_images for select using(exists(select 1 from public.products where id=product_id and status='active'));
create policy public_read on public.store_settings for select using(true);
grant select on public.profiles,public.user_roles,public.orders,public.order_delivery to authenticated;
grant select(id,order_id,variant_id,name,sku,size,color,quantity,unit_price,discount) on public.order_items to authenticated;
create policy own_read on public.profiles for select to authenticated using(id=auth.uid());
create policy own_read on public.user_roles for select to authenticated using(user_id=auth.uid());
create policy own_read on public.orders for select to authenticated using(user_id=auth.uid());
create policy own_read on public.order_items for select to authenticated using(exists(select 1 from public.orders where id=order_id and user_id=auth.uid()));
create policy own_read on public.order_delivery for select to authenticated using(exists(select 1 from public.orders where id=order_id and user_id=auth.uid()));
grant select(id,product_id,sku,size,color) on public.variants to anon,authenticated;
create policy public_read on public.variants for select using(exists(select 1 from public.products where id=product_id and status='active'));

create function public.catalog_variants(p_product uuid) returns table(id uuid,sku text,size text,color text,available integer) language sql security definer set search_path='' as $$ select v.id,v.sku,v.size,v.color,v.stock-v.reserved from public.variants v join public.products p on p.id=v.product_id where p.id=p_product and p.status='active' $$;
revoke all on function public.catalog_variants(uuid) from public;
grant execute on function public.catalog_variants(uuid) to anon,authenticated,service_role;

create function public.reserve_order(p_user uuid,p_key uuid,p_items jsonb) returns uuid language plpgsql set search_path='' as $$
declare oid uuid; v record; itm record; rid uuid; h text; total_value integer:=0; cnt integer:=0;
begin
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Carrinho inválido'; end if;
 if exists(select 1 from jsonb_to_recordset(p_items) as x(variant_id uuid,quantity integer) where variant_id is null or quantity is null or quantity not between 1 and 20) then raise exception 'Quantidade inválida'; end if;
 select md5(jsonb_agg(to_jsonb(x) order by variant_id)::text) into h from (select variant_id,sum(quantity) quantity from jsonb_to_recordset(p_items) as i(variant_id uuid,quantity integer) group by variant_id) x;
 perform pg_advisory_xact_lock(hashtextextended(p_user::text||p_key::text,0));
 select id into oid from public.orders where user_id=p_user and request_key=p_key;
 if oid is not null then
 if (select cart_hash from public.orders where id=oid)<>h then raise exception 'Chave reutilizada para outro carrinho'; end if;
 return oid; end if;
 if (select count(*) from public.orders where user_id=p_user and payment_status='pending')>=3 then raise exception 'Conclua ou aguarde os pedidos pendentes'; end if;
 insert into public.orders(user_id,request_key,cart_hash) values(p_user,p_key,h) returning id into oid;
 insert into public.reservations(order_id,expires_at) select oid,expires_at from public.orders where id=oid returning id into rid;
 for itm in select variant_id,sum(quantity)::integer quantity from jsonb_to_recordset(p_items) as i(variant_id uuid,quantity integer) group by variant_id order by variant_id loop
 select a.*,p.name,p.price,p.status into v from public.variants a join public.products p on p.id=a.product_id where a.id=itm.variant_id for update of a,p;
 if not found or v.status<>'active' or itm.quantity>20 or v.stock-v.reserved<itm.quantity then raise exception 'Produto indisponível ou estoque insuficiente'; end if;
 update public.variants set reserved=reserved+itm.quantity where id=v.id;
 insert into public.order_items(order_id,variant_id,name,sku,size,color,quantity,unit_price,cost) values(oid,v.id,v.name,v.sku,v.size,v.color,itm.quantity,v.price,v.cost);
 insert into public.reservation_items values(rid,v.id,itm.quantity);
 total_value:=total_value+v.price*itm.quantity; cnt:=cnt+1;
 end loop;
 if cnt=0 then raise exception 'Carrinho vazio'; end if;
 update public.orders set subtotal=total_value,total=total_value where id=oid;
 insert into public.order_delivery(order_id) values(oid);
 return oid;
end $$;

create function public.settle_order(p_order uuid,p_session text,p_state text,p_amount integer,p_currency text,p_intent text,p_event text,p_type text) returns void language plpgsql set search_path='' as $$
declare o public.orders; r public.reservations; itm record;
begin
 select * into o from public.orders where id=p_order for update;
 if not found then raise exception 'Pedido inexistente'; end if;
 if exists(select 1 from public.stripe_events where id=p_event) then return; end if;
 if o.stripe_session_id is not null and o.stripe_session_id<>p_session then raise exception 'Sessão incorreta'; end if;
 if p_amount<>o.total or p_currency<>'brl' then raise exception 'Valor ou moeda incorretos'; end if;
 update public.orders set stripe_session_id=p_session where id=o.id;
 select * into r from public.reservations where order_id=o.id for update;
 if p_state='paid' and o.payment_status='pending' then
 if r.state<>'active' then raise exception 'Reserva não ativa'; end if;
 for itm in select * from public.reservation_items where reservation_id=r.id order by variant_id loop
 update public.variants set stock=stock-itm.quantity,reserved=reserved-itm.quantity where id=itm.variant_id;
 insert into public.stock_movements(variant_id,delta,reason,order_id) values(itm.variant_id,-itm.quantity,'Venda confirmada',o.id);
 end loop;
 update public.reservations set state='consumed' where id=r.id;
 update public.orders set payment_status='paid',stripe_payment_intent=p_intent where id=o.id;
 insert into public.payments(order_id,stripe_payment_intent,amount) values(o.id,p_intent,o.total);
 elsif p_state='expired' and o.payment_status='pending' and r.state='active' then
 for itm in select * from public.reservation_items where reservation_id=r.id order by variant_id loop
 update public.variants set reserved=reserved-itm.quantity where id=itm.variant_id;
 end loop;
 update public.reservations set state='released' where id=r.id;
 update public.orders set payment_status='expired' where id=o.id;
 end if;
 insert into public.stripe_events(id,type) values(p_event,p_type);
end $$;

create function public.adjust_stock(p_actor uuid,p_variant uuid,p_delta integer,p_reason text) returns void language plpgsql set search_path='' as $$
declare v public.variants;
begin
 if not exists(select 1 from public.user_roles where user_id=p_actor and role='admin') then raise exception 'Sem permissão'; end if;
 if length(trim(p_reason))<5 or p_delta=0 then raise exception 'Informe motivo e quantidade'; end if;
 select * into v from public.variants where id=p_variant for update;
 if not found or v.stock+p_delta<v.reserved then raise exception 'Ajuste conflita com reservas'; end if;
 update public.variants set stock=stock+p_delta where id=p_variant;
 insert into public.stock_movements(variant_id,delta,reason,actor_id) values(p_variant,p_delta,p_reason,p_actor);
 insert into public.audit_log(actor_id,entity,entity_id,operation,before_data,after_data,reason) values(p_actor,'variants',p_variant::text,'stock',jsonb_build_object('stock',v.stock),jsonb_build_object('stock',v.stock+p_delta),p_reason);
end $$;
revoke all on function public.reserve_order(uuid,uuid,jsonb),public.settle_order(uuid,text,text,integer,text,text,text,text),public.adjust_stock(uuid,uuid,integer,text) from public,anon,authenticated;
grant execute on function public.reserve_order(uuid,uuid,jsonb),public.settle_order(uuid,text,text,integer,text,text,text,text),public.adjust_stock(uuid,uuid,integer,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('products','products',true,5242880,array['image/jpeg','image/png','image/webp']);
create policy product_images_read on storage.objects for select using(bucket_id='products');
create policy product_images_insert on storage.objects for insert to authenticated with check(bucket_id='products' and private.is_admin());
create policy product_images_update on storage.objects for update to authenticated using(bucket_id='products' and private.is_admin()) with check(bucket_id='products' and private.is_admin());
create policy product_images_delete on storage.objects for delete to authenticated using(bucket_id='products' and private.is_admin());

-- Catalog/admin changes and their audit entry commit together. Caller is server-only.
create function public.admin_mutate(p_actor uuid,p_entity text,p_id uuid,p_data jsonb,p_reason text default null) returns uuid language plpgsql set search_path='' as $$
declare result_id uuid; old_data jsonb; new_data jsonb;
begin
 if not exists(select 1 from public.user_roles where user_id=p_actor and role='admin') then raise exception 'Sem permissão'; end if;
 if p_entity not in ('products','variants','categories','collections','expenses','product_images','orders') then raise exception 'Entidade inválida'; end if;
 if p_id is not null then execute format('select to_jsonb(t) from public.%I t where id=$1 for update',p_entity) into old_data using p_id; if old_data is null then raise exception 'Registro inexistente'; end if; end if;
 result_id:=coalesce(p_id,gen_random_uuid());
 if p_entity='products' then
 insert into public.products(id,name,slug,description,price,category_id,collection_id,status,featured) values(result_id,p_data->>'name',p_data->>'slug',p_data->>'description',(p_data->>'price')::integer,(p_data->>'category_id')::uuid,(p_data->>'collection_id')::uuid,p_data->>'status',(p_data->>'featured')::boolean) on conflict(id) do update set name=excluded.name,slug=excluded.slug,description=excluded.description,price=excluded.price,category_id=excluded.category_id,collection_id=excluded.collection_id,status=excluded.status,featured=excluded.featured;
 elsif p_entity='variants' then
 insert into public.variants(id,product_id,sku,size,color,cost) values(result_id,(p_data->>'product_id')::uuid,p_data->>'sku',p_data->>'size',p_data->>'color',(p_data->>'cost')::integer) on conflict(id) do update set sku=excluded.sku,size=excluded.size,color=excluded.color,cost=excluded.cost;
 elsif p_entity='categories' then
 insert into public.categories(id,name,slug) values(result_id,p_data->>'name',p_data->>'slug') on conflict(id) do update set name=excluded.name,slug=excluded.slug;
 elsif p_entity='collections' then
 insert into public.collections(id,name,slug,month,active) values(result_id,p_data->>'name',p_data->>'slug',(p_data->>'month')::date,(p_data->>'active')::boolean) on conflict(id) do update set name=excluded.name,slug=excluded.slug,month=excluded.month,active=excluded.active;
 elsif p_entity='expenses' then
 insert into public.expenses(id,description,amount,incurred_on) values(result_id,p_data->>'description',(p_data->>'amount')::integer,(p_data->>'incurred_on')::date) on conflict(id) do update set description=excluded.description,amount=excluded.amount,incurred_on=excluded.incurred_on;
 elsif p_entity='product_images' then
 insert into public.product_images(id,product_id,path,alt,position) values(result_id,(p_data->>'product_id')::uuid,p_data->>'path',p_data->>'alt',(p_data->>'position')::integer) on conflict(id) do update set alt=excluded.alt,position=excluded.position;
 elsif p_entity='orders' then
 if old_data->>'payment_status' not in ('paid','partially_refunded') then raise exception 'Pagamento não confirmado'; end if;
 if p_data->>'fulfillment_status' not in ('preparing','shipped','ready','completed') then raise exception 'Estado inválido'; end if;
 if old_data->>'fulfillment_status'='completed' then raise exception 'Pedido já concluído'; end if;
 update public.orders set fulfillment_status=p_data->>'fulfillment_status' where id=p_id;
 update public.order_delivery set tracking=p_data->>'tracking' where order_id=p_id;
 end if;
 execute format('select to_jsonb(t) from public.%I t where id=$1',p_entity) into new_data using result_id;
 insert into public.audit_log(actor_id,entity,entity_id,operation,before_data,after_data,reason) values(p_actor,p_entity,result_id::text,case when p_id is null then 'create' else 'update' end,old_data,new_data,p_reason);
 return result_id;
end $$;
create function public.update_store_settings(p_actor uuid,p_data jsonb) returns void language plpgsql set search_path='' as $$
declare old_data jsonb;
begin
 if not exists(select 1 from public.user_roles where user_id=p_actor and role='admin') then raise exception 'Sem permissão'; end if;
 select to_jsonb(s) into old_data from public.store_settings s where id=true for update;
 update public.store_settings set whatsapp=p_data->>'whatsapp',address=p_data->>'address',delivery_policy=p_data->>'delivery_policy',returns_policy=p_data->>'returns_policy',privacy_policy=p_data->>'privacy_policy',test_pickup=(p_data->>'test_pickup')::boolean where id=true;
 insert into public.audit_log(actor_id,entity,operation,before_data,after_data) values(p_actor,'store_settings','update',old_data,p_data);
end $$;
create function public.record_refund(p_order uuid,p_refund text,p_amount integer,p_status text,p_total_refunded integer,p_actor uuid) returns void language plpgsql set search_path='' as $$
declare o public.orders;
begin
 select * into o from public.orders where id=p_order for update;
 if not found or p_total_refunded>o.total then raise exception 'Reembolso inválido'; end if;
 insert into public.refunds(id,order_id,amount,status) values(p_refund,p_order,p_amount,p_status) on conflict(id) do update set status=excluded.status;
 if p_status='succeeded' and p_total_refunded>o.refunded then update public.orders set refunded=p_total_refunded,payment_status=case when p_total_refunded=total then 'refunded' else 'partially_refunded' end where id=p_order; end if;
 insert into public.audit_log(actor_id,entity,entity_id,operation,after_data) values(p_actor,'refunds',p_refund,'reconcile',jsonb_build_object('amount',p_amount,'status',p_status));
end $$;
revoke all on function public.admin_mutate(uuid,text,uuid,jsonb,text),public.update_store_settings(uuid,jsonb),public.record_refund(uuid,text,integer,text,integer,uuid) from public,anon,authenticated;
grant execute on function public.admin_mutate(uuid,text,uuid,jsonb,text),public.update_store_settings(uuid,jsonb),public.record_refund(uuid,text,integer,text,integer,uuid) to service_role;
