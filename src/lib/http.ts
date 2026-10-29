export function checkOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (
    !origin ||
    origin !==
      new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
        .origin
  )
    throw new Error('Origem não permitida');
}
export function apiError(error: unknown, status = 400) {
  const message =
    error instanceof Error
      ? error.message
      : 'Não foi possível concluir. Tente novamente.';
  return Response.json(
    { error: message },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}
