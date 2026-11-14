'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Resolve incoming home anchors after the streamed page has mounted. */
export function HomeAnchors() {
  const router = useRouter();
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id === 'novidades') {
      router.replace('/novidades');
      return;
    }
    if (id !== 'inicio') return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [router]);
  return null;
}
