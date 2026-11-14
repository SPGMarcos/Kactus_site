'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

type Look = { image: string; alt: string; label: string };

export function HeroSlideshow({ looks }: { looks: Look[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState<string[]>([]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setReduced(preference.matches);
    const syncVisibility = () => setVisible(!document.hidden);
    syncMotion();
    syncVisibility();
    preference.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      preference.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (paused || interacting || reduced || !visible || looks.length < 2)
      return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % looks.length;
        return ready.includes(looks[next].image) ? next : current;
      });
    }, 5500);
    return () => window.clearInterval(timer);
  }, [paused, interacting, reduced, visible, looks, ready]);

  return (
    <div
      className="hero-slideshow"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Looks de inspiração Kactus"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setInteracting(false);
      }}
    >
      <div className="hero-slides">
        {looks.map((look, index) => (
          <div
            key={look.image}
            className={`hero-slide${index === active ? ' is-active' : ''}`}
            aria-hidden={index !== active}
          >
            <Image
              src={look.image}
              alt=""
              aria-hidden="true"
              className="hero-slide-backdrop"
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
              preload={index === 0}
              loading={index === 0 ? undefined : 'eager'}
            />
            <Image
              src={look.image}
              alt={look.alt}
              className="hero-slide-product"
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
              preload={index === 0}
              loading={index === 0 ? undefined : 'eager'}
              onLoad={() =>
                setReady((current) =>
                  current.includes(look.image)
                    ? current
                    : [...current, look.image],
                )
              }
            />
          </div>
        ))}
        <button
          className="hero-slide-toggle"
          type="button"
          aria-label={
            paused
              ? 'Retomar reprodução automática'
              : 'Pausar reprodução automática'
          }
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        />
      </div>
      <div className="hero-slide-controls">
        <button
          className="hero-slide-arrow hero-slide-previous"
          type="button"
          aria-label="Imagem anterior"
          onClick={() => {
            setActive((current) => (current - 1 + looks.length) % looks.length);
            setPaused(true);
          }}
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>
        <button
          className="hero-slide-arrow hero-slide-next"
          type="button"
          aria-label="Próxima imagem"
          onClick={() => {
            setActive((current) => (current + 1) % looks.length);
            setPaused(true);
          }}
        >
          <ChevronRight size={24} aria-hidden="true" />
        </button>
      </div>
      <div className="hero-slide-dots" role="group" aria-label="Imagens">
        {looks.map((look, index) => (
          <button
            type="button"
            key={look.image}
            aria-label={`Imagem ${index + 1} de ${looks.length}: ${look.label}`}
            aria-current={active === index ? 'true' : undefined}
            onClick={() => {
              setActive(index);
              setPaused(true);
            }}
          >
            <span />
          </button>
        ))}
      </div>
    </div>
  );
}
