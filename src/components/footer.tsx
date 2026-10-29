import Link from 'next/link';
import { settings } from '@/lib/catalog';
export async function Footer() {
  const s = await settings();
  return (
    <footer>
      <div className="footer-top">
        <div>
          <Link href="/" className="footer-brand">
            KACTUS<span>STYLISH</span>
          </Link>
          <p>
            Mais que vestir.
            <br />É sobre marcar presença.
          </p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/">Início</Link>
          <Link href="/loja">Loja</Link>
          <Link href="/carrinho">Carrinho</Link>
          <Link href="/conta">Minha conta</Link>
        </div>
        <div>
          <h3>Informações</h3>
          <Link href="/politicas/entrega">Entrega e retirada</Link>
          <Link href="/politicas/trocas">Trocas e devoluções</Link>
          <Link href="/politicas/privacidade">Privacidade</Link>
        </div>
        <div>
          <h3>A Kactus</h3>
          <p className="footer-contact-copy">
            Moda masculina para quem escolhe se expressar todos os dias.
          </p>
          {s?.whatsapp && (
            <a href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`}>
              Falar pelo WhatsApp ↗
            </a>
          )}
          {s?.address && <p>{s.address}</p>}
          <span className="footer-note">Moda masculina. Sua identidade.</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Kactus Stylish</span>
        <span>AMBIENTE DE TESTES · NENHUMA COBRANÇA REAL</span>
        <Link href="/admin">Área administrativa ↗</Link>
      </div>
    </footer>
  );
}
