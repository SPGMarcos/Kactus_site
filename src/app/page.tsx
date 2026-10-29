import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  MoveUpRight,
  Shirt,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { catalog } from '@/lib/catalog';
import { ProductCard } from '@/components/product-card';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const { products } = await catalog({ featured: 'true' });
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> KACTUS STYLISH · MODA MASCULINA
          </div>
          <h1>
            Seu estilo.
            <br />
            Sua essência.
            <br />
            <em>Sua presença.</em>
          </h1>
          <p>
            Peças que traduzem quem você é.
            <br />
            Do básico indispensável ao detalhe que faz a diferença.
          </p>
          <Link className="button" href="/loja">
            Comprar agora <ArrowUpRight size={19} />
          </Link>
          <div className="hero-bottom">
            <span className="small-star">✳</span>
            <span>
              PERSONALIDADE EM
              <br />
              <strong>CADA DETALHE.</strong>
            </span>
            <span className="hero-index">01 — KACTUS</span>
          </div>
        </div>
        <div
          className="hero-visual"
          role="img"
          aria-label="Referência da Kactus: camiseta masculina de malha clara"
        >
          <div className="editorial-photo photo-knit" />
          <span className="visual-label">O ESSENCIAL NUNCA É COMUM.</span>
          <div className="visual-caption">
            <span>
              VISTA SUA
              <br />
              <strong>melhor versão.</strong>
            </span>
            <Link href="/loja" aria-label="Explorar loja">
              <MoveUpRight />
            </Link>
          </div>
          <span className="photo-credit">
            Imagem da referência da marca · catálogo em preparação
          </span>
        </div>
      </section>
      <div className="values-strip">
        <div>
          <Shirt size={21} />
          <span>Estilo com identidade</span>
        </div>
        <div>
          <Sparkles size={21} />
          <span>Uma seleção com personalidade</span>
        </div>
        <div>
          <RefreshCw size={21} />
          <span>Novas coleções, novas possibilidades</span>
        </div>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ENCONTRE O SEU ESTILO</p>
            <h2>Essenciais, do seu jeito.</h2>
          </div>
          <Link className="text-link" href="/loja">
            Explorar a loja <ArrowRight size={18} />
          </Link>
        </div>
        <div className="editorial-grid">
          {[
            {
              name: 'O básico que marca.',
              subtitle: 'CAMISETAS & ESSENCIAIS',
              photo: 'photo-white',
            },
            {
              name: 'Presença em cada detalhe.',
              subtitle: 'POLOS & TEXTURAS',
              photo: 'photo-knit',
            },
            {
              name: 'Seu próximo favorito.',
              subtitle: 'COMPOSIÇÕES & ESTILO',
              photo: 'photo-red',
            },
          ].map((item, i) => (
            <Link href="/loja" className="editorial-card" key={item.name}>
              <div className={`editorial-photo ${item.photo}`} />
              <span className="editorial-number">0{i + 1}</span>
              <div>
                <p>{item.subtitle}</p>
                <h3>{item.name}</h3>
                <ArrowUpRight />
              </div>
            </Link>
          ))}
        </div>
        <p className="reference-note">
          Inspirações da marca. A disponibilidade das peças será informada no
          catálogo.
        </p>
      </section>
      <section className="section arrivals">
        <div className="section-heading">
          <div>
            <p className="eyebrow">UMA NOVA FORMA DE SE EXPRESSAR</p>
            <h2>Novidades & destaques</h2>
          </div>
          <Link className="text-link" href="/loja?sort=new">
            Ver todos <ArrowRight size={18} />
          </Link>
        </div>
        {products.length ? (
          <div className="product-grid">
            {products.slice(0, 4).map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        ) : (
          <div className="collection-empty">
            <div className="outline-flower">✳</div>
            <div>
              <span className="eyebrow">A PRÓXIMA COLEÇÃO COMEÇA AQUI</span>
              <h3>Um novo capítulo do seu estilo.</h3>
              <p>
                Estamos preparando o catálogo online. Enquanto isso,
                <br />
                acompanhe as peças e novidades no nosso Instagram.
              </p>
            </div>
            <a
              className="button button-outline"
              href="https://www.instagram.com/kactus_stylish_01/"
              target="_blank"
              rel="noreferrer"
            >
              Conhecer as novidades <ArrowUpRight size={18} />
            </a>
          </div>
        )}
      </section>
      <section id="essencia" className="brand-story">
        <div className="story-logo">
          <img
            src="/logo.png"
            alt="Logotipo Kactus Stylish: cacto com coroa amarela"
          />
          <span>ORIGINALIDADE É A NOSSA NATUREZA.</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow">MUITO PRAZER, SOMOS A KACTUS.</p>
          <h2>
            Estilo não se copia.
            <br />
            Se <em>cultiva.</em>
          </h2>
          <p>
            A Kactus Stylish nasceu para quem veste personalidade. Uma seleção
            de moda masculina que conecta o essencial à sua maneira de estar no
            mundo.
          </p>
          <p>
            Peças escolhidas com cuidado. Combinações com atitude.
            <br />E espaço para você ser você.
          </p>
          <a
            className="text-link"
            href="https://www.instagram.com/kactus_stylish_01/"
            target="_blank"
            rel="noreferrer"
          >
            Faça parte do nosso universo <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <section className="instagram-banner">
        <span className="eyebrow">O ESTILO CONTINUA POR LÁ</span>
        <a
          href="https://www.instagram.com/kactus_stylish_01/"
          target="_blank"
          rel="noreferrer"
        >
          @kactus_stylish_01 <ArrowUpRight />
        </a>
        <p>Inspirações, detalhes e novidades da Kactus.</p>
      </section>
    </>
  );
}
