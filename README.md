# Kactus Stylish

Loja de moda masculina em Next.js 16, React 19 e TypeScript. Banco real Supabase, Google OAuth e Stripe Checkout preparados no servidor. **Homologação: login e pagamento ainda dependem de credenciais/configuração; não é uma loja pronta para vender.**

## Executar

Node 24.14.0 e npm. `npm ci`, copie `.env.example` para `.env.local`, configure os campos e execute `npm run dev`. Abra http://localhost:3000. `npm run build` e `npm start` executam produção. Não publique `.env.local`.

Comandos de validação: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. `npm run test:e2e` usa Playwright; `tests/database.sql` verifica integridade no PostgreSQL com rollback. Dados de teste nunca devem virar catálogo comercial.

## Recursos

- Vitrine responsiva com marca fornecida, busca/filtros/ordenação/paginação, detalhes de produtos e carrinho local.
- Sessão Supabase SSR, Google OAuth, conta e pedidos com RLS.
- Produtos, variações/SKU/custo, categorias, coleções, upload de fotos, ajustes de estoque com motivo, pedidos, reembolsos, despesas, indicadores, CSV e auditoria.
- Checkout com preço do banco, reserva atômica, chave idempotente, webhook assinado, reconciliação e snapshots históricos.
- Deploy integrado no Render, health check, CI e migrações SQL.

## Documentação

- [Arquitetura](docs/architecture.md)
- [Modelo de dados](docs/data-model.md)
- [Pagamento e estoque](docs/payment-and-stock-flow.md)
- [Configuração e deploy](docs/deployment.md)
- [Guia administrativo](docs/admin-guide.md)
- [Testes e pendências](docs/test-report.md)

Repositório privado: https://github.com/SPGMarcos/Kactus_site

Supabase: projeto `Kactus Stylish`, ref `cmnwqdcxhibtmqhmdtju`. A chave pública permite apenas operações públicas autorizadas; a chave de servidor permanece exclusiva do ambiente de execução.

## Material visual

Logo e screenshot fornecidos pelo proprietário, em `public/`. As fotos editoriais são enquadramentos CSS da referência, identificadas como inspiração; não há produtos, preços, estoques ou avaliações inventados. Substituir por fotografias originais com boa resolução ao cadastrar o catálogo. A logo preserva proporção.

## Dependências fixadas

Versões exatas em `package.json` e `package-lock.json`; Next 16.4.3, React 19.3.1, Stripe 23.0.1, Supabase JS 2.118.0, SSR 0.12.7, TypeScript 6.0.3. Node 24.14.0. Sem ORM, Redis ou backend separado.
