import { sessionDB } from '@/lib/supabase';
import { safeNext } from '@/lib/utils';
import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  const code = url.searchParams.get('code');
  if (code) {
    const db = await sessionDB();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(safeNext(url.searchParams.get('next')), base),
      );
  }
  return NextResponse.redirect(`${base}/conta?error=oauth`);
}
