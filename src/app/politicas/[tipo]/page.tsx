import { settings } from '@/lib/catalog';
import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function Policy({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  const s = await settings();
  const entry: Record<string, [string, string]> = {
    entrega: [
      'Entrega e retirada',
      s?.delivery_policy ||
        'Rascunho: modalidades e regiões atendidas aguardam definição.',
    ],
    trocas: [
      'Trocas e devoluções',
      s?.returns_policy || 'Rascunho: política comercial aguardando revisão.',
    ],
    privacidade: [
      'Privacidade',
      s?.privacy_policy ||
        'Rascunho: política de privacidade aguardando revisão antes da operação comercial.',
    ],
  };
  if (!entry[tipo]) notFound();
  return (
    <section className="section policy">
      <p className="eyebrow">INFORMAÇÕES KACTUS</p>
      <h1>{entry[tipo][0]}</h1>
      <p>{entry[tipo][1]}</p>
    </section>
  );
}
