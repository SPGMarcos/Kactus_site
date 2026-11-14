import Link from 'next/link';
import Image from 'next/image';
import { Reveal } from '@/components/reveal';
import { HomeAnchors } from '@/components/home-anchors';
import { HeroSlideshow } from '@/components/hero-slideshow';
import { BrandAsterisk } from '@/components/brand-asterisk';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
export const dynamic = 'force-dynamic';
export default function Home() {
  const looks = [
    {
      image: '/look-white-black.png',
      label: 'Preto e branco',
      title: 'Camiseta branca, calça preta',
      alt: 'Camiseta branca, calça preta e tênis brancos em composição masculina.',
    },
    {
      image: '/look-red-denim.png',
      label: 'Jeans',
      title: 'Camiseta vermelha e bermuda jeans',
      alt: 'Camiseta vermelha e bermuda jeans em composição masculina.',
    },
    {
      image: '/look-polo-navy.png',
      label: 'Polo',
      title: 'Branco com azul-marinho',
      alt: 'Polo branca e calça azul-marinho em composição masculina.',
    },
    {
      image: '/look-balmain-black.png',
      label: 'Estampa',
      title: 'Camiseta estampada e bermuda lisa',
      alt: 'Camiseta branca estampada e bermuda preta em composição masculina.',
    },
  ];
  return (
    <>
      <HomeAnchors />
      <section id="inicio" className="hero">
        <div className="hero-copy">
          <div className="cover-masthead" aria-hidden="true">
            <span>Kactus</span>
            <i>Stylish</i>
          </div>

          <h1>
            O que vestir
            <br />
            hoje?
          </h1>
          <p>
            Separamos quatro looks, da camiseta branca com calça preta à polo
            com azul-marinho.
          </p>
          <Link className="button" href="/loja">
            Ver catálogo <ArrowUpRight size={19} />
          </Link>
          <a className="cover-index" href="#caderno">
            Ver os quatro looks ↓
          </a>
        </div>
        <div className="hero-visual">
          <HeroSlideshow looks={looks} />
          <div className="hero-shade" />
          <span className="photo-credit">
            Caderno Kactus · Fotos de inspiração
          </span>
        </div>
      </section>
      <Reveal>
        <section id="caderno" className="section lookbook-edition">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Nesta edição</p>
              <h2>Quatro combinações</h2>
            </div>
            <Link className="text-link" href="/loja">
              Explorar a loja <ArrowRight size={18} />
            </Link>
          </div>
          <div className="lookbook-grid">
            {looks.map((look, i) => (
              <Link href="/loja" className="look-card" key={look.image}>
                <Image
                  src={look.image}
                  alt={look.alt}
                  fill
                  sizes="(max-width: 600px) 92vw, 35vw"
                />
                <span className="look-number">0{i + 1}</span>
                <div className="look-card-copy">
                  <p>{look.label}</p>

                  <h3>{look.title}</h3>
                  <ArrowUpRight aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
          <p className="reference-note">
            Gostou de uma peça da foto? Consulte o catálogo para ver se ela está
            disponível.
          </p>
        </section>
      </Reveal>
      <div className="edition-band" aria-hidden="true">
        <div className="edition-type">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              Kactus Stylish <i><BrandAsterisk /></i>
            </span>
          ))}
        </div>
      </div>
      <Reveal>
        <section id="essencia" className="brand-story">
          <div className="story-logo">
            <Image
              width={260}
              height={260}
              src="/logo.png"
              alt="Logotipo Kactus Stylish: cacto com coroa amarela"
            />
          </div>

          <div className="story-copy">
            <p className="eyebrow">Nossas lojas</p>
            <h2>Buenópolis e Curvelo</h2>

            <p>Nossas duas lojas ficam em Minas Gerais.</p>
            <p>
              Quer saber se tem seu tamanho antes de passar na loja? Escolha a
              unidade e mande uma mensagem.
            </p>
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section
          className="instagram-editorial"
          aria-labelledby="instagram-title"
        >
          <div className="instagram-copy">
            <div className="instagram-kicker">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
              <span>FALE COM A GENTE</span>
            </div>
            <h2 id="instagram-title">Instagram da loja</h2>
            <p>Buenópolis · Curvelo</p>
            <div className="instagram-links">
              <a
                className="button"
                href="https://www.instagram.com/kactus_stylish_01/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Conversar pelo Instagram{' '}
                <ArrowUpRight size={20} aria-hidden="true" />
              </a>
            </div>
          </div>

          <aside className="contact-panel" aria-labelledby="contact-title">
            <div className="contact-kicker">
              <svg
                className="whatsapp-icon"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L4 20l1.1-4a8.2 8.2 0 1 1 15.1-4.3Z" />
                <path d="M8.8 8.2c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4-.1.6l-.6.7c-.2.2-.2.4 0 .7.7 1.1 1.5 1.8 2.6 2.4.3.2.5.1.7-.1l.8-.9c.2-.2.4-.2.7-.1l1.7.8c.3.1.4.3.4.5 0 .3-.2 1.2-.8 1.6-.6.5-1.3.7-2.1.6-1.2-.2-2.8-.9-4.4-2.3-1.3-1.1-2.2-2.6-2.5-3.8-.3-1.1 0-1.9.4-2.4.3-.4.8-.5 1.2-.5Z" />
              </svg>
              <span>FALE COM A GENTE</span>
            </div>
            <h2 id="contact-title">WhatsApp das lojas</h2>
            <p>Buenópolis · Curvelo</p>
            <a
              className="button contact-button"
              href="https://bio.site/kactusstylish01?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAcGRvZgJzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAad_gLLTODs23ps4tzb8IEKcIDE-QdEAnEGJuEux4eypU6KsTD4xY8qUTQJptA_aem_xIIEKmLxuXkFiulXz9H3IQ"
              target="_blank"
              rel="noopener noreferrer"
            >
              Escolher loja <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          </aside>
        </section>
      </Reveal>
    </>
  );
}
