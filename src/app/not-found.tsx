import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="empty-state">
      <span>404</span>
      <h1>Essa página não está por aqui.</h1>
      <Link className="button" href="/loja">
        Explorar a loja
      </Link>
    </div>
  );
}
