'use client';
import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { money } from '@/lib/utils';
export function FinancePanel() {
  const [from, setFrom] = useState('2026-01-01');
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/finance?from=${from}&to=${to}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        if (!cancelled) {
          setReport(data);
          setError('');
        }
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);
  return (
    <>
      <div className="admin-actions">
        <label>
          De
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Até
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <a
          className="button button-outline"
          href={`/api/admin/finance?from=${from}&to=${to}&format=csv`}
        >
          Exportar todos os pedidos do período
        </a>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {report && (
        <>
          <div className="metric-grid">
            {[
              ['revenue', 'Faturamento bruto'],
              ['discounts', 'Descontos'],
              ['shipping', 'Frete cobrado'],
              ['refunds', 'Reembolsos'],
              ['known_cost', 'Custos conhecidos'],
              ['fees', 'Taxas conciliadas'],
              ['expenses', 'Despesas'],
              ['estimated_result', 'Resultado estimado'],
              ['pending_amount', 'Pagamentos pendentes'],
              ['reconciled', 'Pagamentos conciliados'],
            ].map(([key, label]) => (
              <div className="metric" key={key}>
                <span>{label}</span>
                <strong>{money(report[key])}</strong>
              </div>
            ))}
          </div>
          <p className="notice">
            Resultado estimado = total confirmado − reembolsos − custos
            conhecidos − taxas conhecidas − despesas.{' '}
            {report.unknown_cost_items} itens têm custo desconhecido;{' '}
            {report.unknown_fees} pagamentos ainda não têm taxa conciliada.
            Estoque devolvido não é reposto automaticamente. O saldo disponível
            do Stripe não é calculado por esta tela.
          </p>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Vendas', value: report.gross / 100 },
                  { name: 'Reembolsos', value: report.refunds / 100 },
                  { name: 'Custos', value: report.known_cost / 100 },
                  { name: 'Taxas', value: report.fees / 100 },
                  { name: 'Despesas', value: report.expenses / 100 },
                  { name: 'Resultado', value: report.estimated_result / 100 },
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#747e48" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </>
  );
}
