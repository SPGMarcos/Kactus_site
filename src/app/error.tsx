'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <h2>Não foi possível carregar esta página.</h2>
      <p>Tente novamente em alguns instantes.</p>
      <button className="button" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
