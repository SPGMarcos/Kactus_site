# Modelo de dados

profiles e user_roles: identidade e autorização. categories e collections: navegação. products, variants e product_images: catálogo, SKU único e foto ordenada. orders e order_items: histórico imutável de itens/preços/custos. order_delivery: modalidade e endereço quando necessário. reservations e reservation_items: unidades retidas. stock_movements: movimentações auditáveis. payments, stripe_events e refunds: conciliação. expenses: despesas manuais. audit_log: mudanças de servidor. store_settings: configuração comercial pública.

Orders têm payment_status separado de fulfillment_status. Relações usam UUIDs e FKs; produtos de pedidos não são apagados. Índices cobrem proprietário/data, status, categoria, coleção e referências externas. RLS em todas as tabelas; operações de estoque somente por RPC de servidor.
