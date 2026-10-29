create function private.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name) values(new.id,left(new.raw_user_meta_data->>'full_name',150)) on conflict(id) do nothing;
 return new;
end $$;
revoke all on function private.handle_new_user() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();
create index on public.reservation_items(variant_id);
create index on public.order_items(variant_id);
create index on public.refunds(order_id);
create index on public.expenses(incurred_on);
create index on public.payments(created_at);
create index on public.stock_movements(order_id);
create index on public.stock_movements(actor_id);
create index on public.products(created_at desc);

-- Reject invalid state transitions even when a privileged application calls the mutation RPC.
create function private.guard_fulfillment() returns trigger language plpgsql set search_path='' as $$
begin
 if new.fulfillment_status is distinct from old.fulfillment_status then
 if new.payment_status not in ('paid','partially_refunded') then raise exception 'Pagamento não confirmado';end if;
 if not ((old.fulfillment_status='pending' and new.fulfillment_status='preparing') or (old.fulfillment_status='preparing' and new.fulfillment_status in('ready','shipped')) or (old.fulfillment_status in('ready','shipped') and new.fulfillment_status='completed')) then raise exception 'Transição de atendimento inválida';end if;
 end if;
 return new;
end $$;
revoke all on function private.guard_fulfillment() from public,anon,authenticated;
create trigger guard_fulfillment before update on public.orders for each row execute function private.guard_fulfillment();
