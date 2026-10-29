import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export const configured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
export function publicDB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}
export function adminDB() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error('Credencial de servidor do Supabase não configurada.');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function sessionDB() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server components cannot set cookies; proxy refreshes them. */
          }
        },
      },
    },
  );
}
export async function identity() {
  if (!configured()) return null;
  const db = await sessionDB();
  const {
    data: { user },
  } = await db.auth.getUser();
  return user;
}
export async function requireAdmin() {
  const user = await identity();
  if (!user) throw new Error('Não autenticado');
  const db = await sessionDB();
  const { data } = await db
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();
  if (data?.role !== 'admin') throw new Error('Acesso restrito');
  return user;
}
