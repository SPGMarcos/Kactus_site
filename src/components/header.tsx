'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, UserRound, ShoppingBag, Menu, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useCart } from './cart-provider';
export function Header() {
  const { items } = useCart();
  const path = usePathname();
  const active = path === '/' ? '/#inicio' : path;
  const navigate = (href: string) => {
    if (path === '/' && href.startsWith('/#')) {
      const target = document.getElementById(href.split('#')[1]);
      if (href === '/#inicio')
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'instant'
            : 'smooth',
        });
      else target?.scrollIntoView();
    }
  };
  return (
    <>
      <div className="announcement">REFERÊNCIA EM MODA MASCULINA</div>
      <header className="header">
        <Link
          className="brand"
          href="/#inicio"
          onNavigate={() => navigate('/#inicio')}
          aria-label="Kactus Stylish, início"
        >
          <img src="/logo.png" alt="" />
        </Link>
        <nav className="desktop-nav" aria-label="Principal">
          {[
            ['/#inicio', 'Início'],
            ['/loja', 'Loja'],
            ['/novidades', 'Novidades'],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onNavigate={() => navigate(href)}
              className={active === href ? 'active' : ''}
              aria-current={
                active === href
                  ? href !== '/#inicio'
                    ? 'page'
                    : 'location'
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/loja#busca" aria-label="Buscar produtos">
            <Search size={21} />
          </Link>
          <Link href="/conta" aria-label="Minha conta">
            <UserRound size={21} />
          </Link>
          <Link
            className="bag"
            href="/carrinho"
            aria-label={`Carrinho, ${items.reduce((n, i) => n + i.quantity, 0)} itens`}
          >
            <ShoppingBag size={21} />
            <span>{items.reduce((n, i) => n + i.quantity, 0)}</span>
          </Link>
          <Dialog.Root>
            <Dialog.Trigger
              className="mobile-menu icon-button"
              aria-label="Abrir menu"
            >
              <Menu />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="dialog-overlay" />
              <Dialog.Content className="menu-content">
                <Dialog.Title>Menu da Kactus</Dialog.Title>
                <Dialog.Description>
                  Acesse a loja, sua conta ou o carrinho.
                </Dialog.Description>
                <Dialog.Close
                  className="icon-button close"
                  aria-label="Fechar menu"
                >
                  <X />
                </Dialog.Close>
                {[
                  ['/#inicio', 'Início'],
                  ['/loja', 'Loja'],
                  ['/novidades', 'Novidades'],
                  ['/conta', 'Minha conta'],
                  ['/carrinho', 'Carrinho'],
                ].map(([href, label]) => (
                  <Dialog.Close asChild key={href}>
                    <Link
                      href={href}
                      onNavigate={() => navigate(href)}
                      className={active === href ? 'active' : ''}
                      aria-current={active === href ? 'page' : undefined}
                    >
                      {label}
                    </Link>
                  </Dialog.Close>
                ))}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </header>
    </>
  );
}
