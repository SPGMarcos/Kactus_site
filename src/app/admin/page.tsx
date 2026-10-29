import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { AdminPanel } from '@/components/admin-panel';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Administração' };
export default async function Admin() {
  try {
    await requireAdmin();
  } catch {
    return (
      <section className="section">
        <div className="empty-state">
          <h1>Acesso administrativo.</h1>
          <p>Entre com a conta Google autorizada pelo proprietário da loja.</p>
          <a className="button" href="/auth/login?next=/admin">
            Entrar com Google
          </a>
          <Link className="text-link" style={{ marginTop: 20 }} href="/">
            Voltar para a loja
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section className="section">
      <p className="eyebrow">KACTUS STYLISH · GESTÃO</p>
      <h1>Seu negócio, por inteiro.</h1>
      <AdminPanel />
    </section>
  );
}
