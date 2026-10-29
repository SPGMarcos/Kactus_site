import Link from 'next/link';
export default function Cancelled() {
  return (
    <section className="section">
      <div className="empty-state">
        <h1>Checkout interrompido.</h1>
        <p>
          Seu carrinho continua guardado. Se houve pagamento, consulte o status
          na sua conta. A reserva só será liberada após a expiração confirmada
          da sessão.
        </p>
        <Link className="button" href="/carrinho">
          Voltar ao carrinho
        </Link>
        <Link className="text-link" style={{ marginTop: 20 }} href="/conta">
          Consultar pedidos
        </Link>
      </div>
    </section>
  );
}
