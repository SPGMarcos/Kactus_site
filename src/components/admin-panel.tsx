'use client';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FinancePanel } from './finance-panel';
import { date } from '@/lib/utils';
type Row = Record<string, string | number | boolean | null>;
const tabs = [
  ['overview', 'Visão geral'],
  ['products', 'Produtos'],
  ['categories', 'Categorias'],
  ['collections', 'Coleções'],
  ['variants', 'Estoque'],
  ['orders', 'Pedidos'],
  ['finance', 'Finanças'],
  ['expenses', 'Despesas'],
  ['audit_log', 'Histórico'],
  ['settings', 'Configurações'],
];
const fieldSets: Record<
  string,
  { name: string; label: string; type?: string; options?: string[] }[]
> = {
  products: [
    { name: 'name', label: 'Nome' },
    { name: 'slug', label: 'URL (ex.: camiseta-basica)' },
    { name: 'description', label: 'Descrição', type: 'textarea' },
    {
      name: 'price',
      label: 'Preço em centavos (12990 = R$ 129,90)',
      type: 'number',
    },
    { name: 'category_id', label: 'Categoria', type: 'category' },
    { name: 'collection_id', label: 'Coleção', type: 'collection' },
    {
      name: 'status',
      label: 'Status',
      options: ['draft', 'active', 'archived'],
    },
    { name: 'featured', label: 'Produto em destaque', type: 'checkbox' },
  ],
  variants: [
    { name: 'product_id', label: 'Produto', type: 'product' },
    { name: 'sku', label: 'SKU único' },
    { name: 'size', label: 'Tamanho' },
    { name: 'color', label: 'Cor' },
    {
      name: 'cost',
      label: 'Custo em centavos (vazio = desconhecido)',
      type: 'number',
    },
  ],
  categories: [
    { name: 'name', label: 'Nome' },
    { name: 'slug', label: 'URL' },
  ],
  collections: [
    { name: 'name', label: 'Nome' },
    { name: 'slug', label: 'URL' },
    { name: 'month', label: 'Mês (primeiro dia)', type: 'date' },
    { name: 'active', label: 'Coleção ativa', type: 'checkbox' },
  ],
  expenses: [
    { name: 'description', label: 'Descrição' },
    { name: 'amount', label: 'Valor em centavos', type: 'number' },
    { name: 'incurred_on', label: 'Data', type: 'date' },
  ],
  stock: [
    { name: 'variant_id', label: 'Variação', type: 'variant' },
    { name: 'delta', label: 'Entrada (+) ou saída (-)', type: 'number' },
    { name: 'reason', label: 'Motivo obrigatório (mínimo 5 caracteres)' },
  ],
  orders: [
    {
      name: 'fulfillment_status',
      label: 'Atendimento',
      options: ['preparing', 'ready', 'shipped', 'completed'],
    },
    { name: 'tracking', label: 'Rastreamento (opcional)' },
  ],
  settings: [
    { name: 'whatsapp', label: 'WhatsApp com código do país (opcional)' },
    { name: 'address', label: 'Endereço completo (opcional)' },
    { name: 'delivery_policy', label: 'Entrega e retirada', type: 'textarea' },
    { name: 'returns_policy', label: 'Trocas e devoluções', type: 'textarea' },
    { name: 'privacy_policy', label: 'Privacidade', type: 'textarea' },
    {
      name: 'test_pickup',
      label: 'Permitir retirada de teste',
      type: 'checkbox',
    },
  ],
  product_images: [
    { name: 'product_id', label: 'Produto', type: 'product' },
    { name: 'path', label: 'Caminho no Storage' },
    { name: 'alt', label: 'Descrição acessível' },
    { name: 'position', label: 'Ordem (0 = principal)', type: 'number' },
  ],
};
async function api(entity: string, page = 1) {
  const res = await fetch(`/api/admin?entity=${entity}&page=${page}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error);
  return body as { data: Row[]; count: number };
}
export function AdminPanel() {
  const [tab, setTab] = useState('overview');
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ entity: string; row?: Row } | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [refs, setRefs] = useState<Record<string, Row[]>>({});
  const [detail, setDetail] = useState<Row[] | null>(null);
  const load = useCallback(async () => {
    setBusy(true);
    try {
      if (tab === 'overview' || tab === 'finance') {
        const results = await Promise.all(
          ['orders', 'variants', 'expenses', 'payments', 'audit_log'].map((e) =>
            api(e),
          ),
        );
        setRefs((old) => ({
          ...old,
          ...Object.fromEntries(
            ['orders', 'variants', 'expenses', 'payments', 'audit_log'].map(
              (e, i) => [e, results[i].data],
            ),
          ),
        }));
        setRows(results[0].data);
        setCount(results[0].count);
      } else {
        const result = await api(
          tab === 'settings' ? 'store_settings' : tab,
          page,
        );
        setRows(result.data);
        setCount(result.count);
        if (tab === 'settings')
          setForm({ entity: 'settings', row: result.data[0] });
      }
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }, [tab, page]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  useEffect(() => {
    void Promise.all(
      ['products', 'variants', 'categories', 'collections'].map((e) => api(e)),
    )
      .then((results) =>
        setRefs((old) => ({
          ...old,
          ...Object.fromEntries(
            ['products', 'variants', 'categories', 'collections'].map(
              (e, i) => [e, results[i].data],
            ),
          ),
        })),
      )
      .catch(() => {});
  }, [message]);
  async function save(
    entity: string,
    row: Row | undefined,
    data: Record<string, unknown>,
  ) {
    setMessage('');
    setBusy(true);
    try {
      if (
        entity === 'products' &&
        data.status === 'archived' &&
        !window.confirm(
          'Arquivar este produto? O histórico dos pedidos será preservado.',
        )
      )
        return;
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, id: typeof row?.id === 'string' ? row.id : null, data }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setMessage('Alteração salva e registrada no histórico.');
      setForm(null);
      await load();
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function action(path: string, payload: unknown) {
    setBusy(true);
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(JSON.stringify(data));
      await load();
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <nav className="admin-tabs" aria-label="Seções administrativas">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? 'selected' : ''}
            onClick={() => {
              setTab(key);
              setPage(1);
              setForm(null);
              setDetail(null);
              setMessage('');
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      {message && (
        <p
          className="notice"
          role="status"
          style={{ overflowWrap: 'anywhere' }}
        >
          {message}
        </p>
      )}
      {busy && <p role="status">Carregando…</p>}
      {(tab === 'overview' || tab === 'finance') && <>
        <FinancePanel key={message}/>
        <div className="admin-actions">
          <button className="button" disabled={busy} onClick={()=>action('/api/admin/reconcile',{})}>Reconciliar pedidos e taxas</button>
          {tab==='finance' && <button className="button button-outline" onClick={()=>setForm({entity:'expenses'})}>Registrar despesa</button>}
        </div>
        {tab==='finance' ? <DataTable rows={refs.expenses||[]} onEdit={row=>setForm({entity:'expenses',row})}/> : <><h2>Últimas alterações</h2><DataTable rows={(refs.audit_log||[]).slice(0,10)}/></>}
      </>}
      {['products', 'categories', 'collections', 'expenses', 'variants', 'orders', 'audit_log'].includes(tab) && (
        <>
          {tab !== 'audit_log' && (
            <div className="admin-actions">
              {['categories','collections','expenses'].includes(tab)&&<button className="button" onClick={()=>setForm({entity:tab})}>Adicionar registro</button>}
              {tab === 'products' && (
                <>
                  <button
                    className="button"
                    onClick={() => setForm({ entity: 'products' })}
                  >
                    Novo produto
                  </button>
                  <button
                    className="button button-outline"
                    onClick={() => setForm({ entity: 'categories' })}
                  >
                    Nova categoria
                  </button>
                  <button
                    className="button button-outline"
                    onClick={() => setForm({ entity: 'collections' })}
                  >
                    Nova coleção
                  </button>
                  <button
                    className="button button-outline"
                    onClick={async () => {
                      const data = await api('product_images');
                      setDetail(data.data);
                    }}
                  >
                    Ordenar fotos
                  </button>
                </>
              )}
              {tab === 'variants' && (
                <>
                  <button
                    className="button"
                    onClick={() => setForm({ entity: 'variants' })}
                  >
                    Nova variação
                  </button>
                  <button
                    className="button button-outline"
                    onClick={() => setForm({ entity: 'stock' })}
                  >
                    Ajustar estoque
                  </button>
                  <button
                    className="button button-outline"
                    onClick={async () =>
                      setDetail((await api('stock_movements')).data)
                    }
                  >
                    Ver movimentações
                  </button>
                </>
              )}
              {tab === 'orders' && (
                <button
                  className="button"
                  onClick={() => action('/api/admin/reconcile', {})}
                >
                  Reconciliar pendentes
                </button>
              )}
            </div>
          )}
          <DataTable
            rows={rows}
            onEdit={
              tab === 'audit_log'
                ? undefined
                : (row) => setForm({ entity: tab, row })
            }
            extra={
              tab === 'orders'
                ? (row) => (
                    <>
                      <button
                        onClick={async () => {
                          const r = await fetch(
                            `/api/admin?entity=order_items&order=${row.id}`,
                          );
                          setDetail((await r.json()).data);
                        }}
                      >
                        Itens
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              'Confirmar cancelamento da sessão? Se já estiver paga, será necessário reembolso.',
                            )
                          )
                            void action('/api/admin/refund', {
                              order_id: row.id,
                              action: 'cancel',
                              confirmed: true,
                            });
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              'Solicitar reembolso integral? O estoque NÃO será reposto automaticamente.',
                            )
                          )
                            void action('/api/admin/refund', {
                              order_id: row.id,
                              action: 'refund',
                              confirmed: true,
                            });
                        }}
                      >
                        Reembolsar
                      </button>
                    </>
                  )
                : undefined
            }
          />
          <div className="admin-actions">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              ← Anterior
            </button>
            <span>
              Página {page} · {count} registros
            </span>
            <button
              disabled={page * 50 >= count}
              onClick={() => setPage(page + 1)}
            >
              Próxima →
            </button>
          </div>
        </>
      )}
      {detail && (
        <div className="admin-section">
          <h2>Detalhes</h2>
          <DataTable
            rows={detail}
            onEdit={
              detail[0]?.path
                ? (row) => setForm({ entity: 'product_images', row })
                : undefined
            }
          />
        </div>
      )}
      {form && (
        <Editor
          key={form.entity + String(form.row?.id)}
          entity={form.entity}
          row={form.row}
          refs={refs}
          busy={busy}
          onSave={(data) => save(form.entity, form.row, data)}
          onCancel={() => setForm(null)}
        />
      )}{' '}
      {tab === 'products' && (
        <Upload products={refs.products || []} onMessage={setMessage} />
      )}
    </>
  );
}
function DataTable({
  rows,
  onEdit,
  extra,
}: {
  rows: Row[];
  onEdit?: (row: Row) => void;
  extra?: (row: Row) => React.ReactNode;
}) {
  if (!rows.length)
    return <p className="notice">Nenhum registro neste período.</p>;
  const keys = Object.keys(rows[0]).filter(
    (k) => !['cart_hash', 'request_key'].includes(k),
  );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {(onEdit || extra) && <th>Ações</th>}
            {keys.map((k) => (
              <th key={k}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id || index)}>
              {(onEdit || extra) && (
                <td>
                  {onEdit && (
                    <button onClick={() => onEdit(row)}>Editar</button>
                  )}{' '}
                  {extra?.(row)}
                </td>
              )}
              {keys.map((k) => (
                <td
                  key={k}
                  title={
                    typeof row[k] === 'object'
                      ? JSON.stringify(row[k])
                      : String(row[k] ?? '')
                  }
                >
                  {k === 'created_at'
                    ? date(String(row[k]))
                    : typeof row[k] === 'object'
                      ? JSON.stringify(row[k]).slice(0, 150)
                      : String(row[k] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Editor({
  entity,
  row,
  refs,
  busy,
  onSave,
  onCancel,
}: {
  entity: string;
  row?: Row;
  refs: Record<string, Row[]>;
  busy: boolean;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const { register, handleSubmit } = useForm<Record<string, unknown>>({
    defaultValues: row || {
      status: 'draft',
      featured: false,
      active: true,
      test_pickup: true,
    },
  });
  const fields = fieldSets[entity];
  return (
    <form
      className="admin-form"
      onSubmit={handleSubmit((values) => {
        const data: Record<string, unknown> = {};
        fields.forEach((f) => {
          const v = values[f.name];
          data[f.name] =
            f.type === 'number'
              ? v === '' || v === null || v === undefined
                ? null
                : Number(v)
              : f.type === 'checkbox'
                ? Boolean(v)
                : [
                      'category_id',
                      'collection_id',
                      'tracking',
                      'whatsapp',
                      'address',
                    ].includes(f.name)
                  ? v || null
                  : v;
        });
        onSave(data);
      })}
    >
      <h3>
        {row ? 'Editar' : 'Adicionar'} · {entity}
      </h3>
      {fields.map((f) => {
        const lookup: { [key: string]: string } = {
          category: 'categories',
          collection: 'collections',
          product: 'products',
          variant: 'variants',
        };
        const entries = refs[lookup[f.type || '']] || [];
        return (
          <label key={f.name}>
            {f.label}
            {f.type === 'textarea' ? (
              <textarea {...register(f.name)} />
            ) : f.options ? (
              <select {...register(f.name)}>
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : lookup[f.type || ''] ? (
              <select {...register(f.name)}>
                <option value="">Selecione</option>
                {entries.map((e) => (
                  <option key={String(e.id)} value={String(e.id)}>
                    {e.name || `${e.sku} · ${e.size} · ${e.color}`}
                  </option>
                ))}
              </select>
            ) : (
              <input type={f.type || 'text'} {...register(f.name)} />
            )}
          </label>
        );
      })}
      <div className="admin-actions wide">
        <button className="button" disabled={busy}>
          Salvar alteração
        </button>
        <button
          className="button button-outline"
          type="button"
          onClick={onCancel}
        >
          Fechar
        </button>
      </div>
    </form>
  );
}
function Upload({
  products,
  onMessage,
}: {
  products: Row[];
  onMessage: (m: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const form = e.currentTarget;
        try {
          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: new FormData(form),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body.error);
          onMessage('Foto enviada ao Supabase Storage.');
          form.reset();
        } catch (e) {
          onMessage(String(e));
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>Fotos dos produtos</h3>
      <label>
        Produto
        <select name="product_id" required>
          <option value="">Selecione</option>
          {products.map((p) => (
            <option key={String(p.id)} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Imagem (PNG, JPEG ou WebP · até 5 MB)
        <input
          type="file"
          name="file"
          accept="image/png,image/jpeg,image/webp"
          required
        />
      </label>
      <label>
        Descrição acessível
        <input name="alt" required minLength={2} />
      </label>
      <label>
        Ordem (0 = principal)
        <input
          name="position"
          type="number"
          min="0"
          defaultValue="0"
          required
        />
      </label>
      <button disabled={busy} className="button">
        {busy ? 'Enviando…' : 'Enviar foto'}
      </button>
    </form>
  );
}
