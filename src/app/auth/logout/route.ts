import { sessionDB } from '@/lib/supabase';
import { checkOrigin, apiError } from '@/lib/http';
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await (await sessionDB()).auth.signOut();
    return Response.redirect(
      new URL('/conta', process.env.NEXT_PUBLIC_SITE_URL),
      303,
    );
  } catch (e) {
    return apiError(e);
  }
}
