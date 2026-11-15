import Link from 'next/link';
import Image from 'next/image';
import { settings } from '@/lib/catalog';
export async function Footer() {
  const s = await settings();
  return (
    <footer>
      <div className="footer-top">
        <div>

          <Link href="/" className="footer-brand" aria-label="Kactus Stylish, início">
            <Image src="/logo.png" width={112} height={112} alt="" />
          </Link>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/#inicio">Início</Link>
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
          <h3>
            {s?.whatsapp || s?.address
              ? 'Fale com a Kactus'
              : 'Nossas lojas'}
          </h3>
          {s?.whatsapp && (
            <a href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`}>
              WhatsApp
            </a>
          )}
          {s?.address && <p>{s.address}</p>}
          <Link href="/#essencia">Buenópolis e Curvelo · MG</Link>
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
