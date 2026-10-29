import { sessionDB, configured } from '@/lib/supabase';
import { safeNext } from '@/lib/utils';
import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  if (!configured()) return NextResponse.redirect(`${base}/conta?error=config`);
  const next = safeNext(new URL(request.url).searchParams.get('next'));
  const db = await sessionDB();
  const { data, error } = await db.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${base}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  return NextResponse.redirect(
    error || !data.url ? `${base}/conta?error=oauth` : data.url,
  );
}
