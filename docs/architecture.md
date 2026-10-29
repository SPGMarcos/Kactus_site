# Arquitetura — Kactus Stylish

Next.js App Router/React/TypeScript em um Render Web Service. PostgreSQL, Auth Google e Storage no Supabase. Stripe Checkout hospedado, inicialmente somente cartão de teste. Nenhum arquivo de cliente é persistido no Render.

O catálogo público consulta somente campos comerciais. Custos, reservas, pagamentos e auditoria ficam protegidos por RLS e permissões. Administradores são membros de `user_roles`, tabela sem escrita por clientes. A autorização usa identidade validada pelo Supabase no servidor, nunca user_metadata.

O banco é a fonte de verdade do estoque: variants.stock e variants.reserved, com 0 <= reserved <= stock. Compras e ajustes bloqueiam linhas em ordem de UUID. Pedidos guardam snapshots. Valores são centavos BRL; timestamps UTC, apresentação America/Sao_Paulo.

Sem credenciais, a vitrine exibe estado de configuração e catálogo vazio: não existem produtos fictícios publicados. Material editorial vem das referências fornecidas; não representa disponibilidade comercial.

## Fluxo crítico

Carrinho local → login Google → validação Zod no servidor → RPC atômica cria pedido/reserva → Stripe idempotente → persistência da sessão → webhook verificado → RPC atômica baixa estoque. Falha ambígua mantém reserva para reconciliação. Nunca liberar apenas pelo relógio local.

## Limites deliberados

Retirada de teste, sem endereço inventado; políticas configuráveis e inicialmente rascunho. Produção exige revisão comercial, segredos, testes ponta a ponta e validação operacional. O app não presume um domínio Render disponível.
