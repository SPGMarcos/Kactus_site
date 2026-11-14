# Relatório de validação

Ambiente: Windows, Node 24.14.0; Supabase PostgreSQL remoto separado da loja, 29/10/2026. Atualizado ao finalizar a entrega.

## Executado

- Build Next.js de produção, verificação TypeScript e ESLint.
- Vitest: **17 testes aprovados**, cobrindo validação do carrinho, recusa de preço adulterado/quantidades inválidas, motivo de ajuste, redirecionamentos seguros, CSV e centavos; assinatura Stripe com payload original e adulterado (fixture local, não um pagamento).
- `tests/database.sql` no PostgreSQL real, com rollback: reserva idempotente, estoque insuficiente, ajuste contra reservas, validação de valor, eventos que falham sem marcação, duplicatas, evento atrasado de expiração após pagamento, snapshots, expiração repetida, RLS entre clientes, proteção de papéis, permissão de RPC e ocultação de custo.
- Concorrência real: duas transações independentes disputaram a última unidade; uma reservou e a outra recebeu estoque insuficiente. Resultado: físico 1, reservado 1, disponível 0, apenas um pedido. Fixtures removidas após a verificação.
- Advisor de segurança Supabase: nenhum alerta depois de tornar consulta de variações SECURITY INVOKER, com coluna calculada available e permissões de coluna.
- Prévia no navegador: página inicial, conta e navegação para catálogo renderizadas; screenshot `docs/preview-desktop.png`. Sem overflow na largura desktop observada. A ferramenta de viewport não aplicou 360 px de forma verificável; responsividade mobile não é declarada aprovada.
- `render.yaml` validado contra o schema oficial JSON Schema 2020-12 com AJV. A CLI Render não foi instalada; validação semântica de serviço segue pendente de acesso ao repositório.
- Build final com Webpack aprovado. Turbopack teve erro interno de subprocesso no Windows; o comando de build usa `next build --webpack`, suportado pelo mesmo Next.js.

## Fornecido para CI / execução posterior

Playwright em desktop e 360 px: navegação, filtros, carrinho persistente, página de login, bloqueio de admin anônimo, retorno sem falsa confirmação e overflow. A suíte Playwright foi fornecida, mas não executada localmente. O fluxo Google completo não é simulado como aprovado. O workflow CI foi publicado, porém seu resultado remoto não foi obtido: o conector GitHub retornou 404 para o repositório novo.

## Bloqueado por configuração externa

O proprietário informou ainda não ter Stripe nem cliente Google OAuth. Portanto login real, logout com sessão real, checkout Stripe real de teste, pagamento fim a fim, timeout real na criação de sessão, retry de webhook via Stripe e reinício durante pagamento NÃO foram verificados. A chave de servidor Supabase também precisa ser configurada para as operações administrativas da aplicação.

## Ainda não verificado

Operação administrativa via conta Google real, upload com sessão real, reembolso no Stripe, conciliação de taxas reais de sandbox, recuperação de falha de rede real, carga e auditoria externa de segurança. Os testes SQL verificam as transações, mas não substituem a homologação completa das integrações.

## Critério de liberação

Não abrir vendas até concluir os itens bloqueados, cadastrar catálogo real, definir entrega/políticas e revisar infraestrutura. A entrega é código e ambiente de testes, não certificação de operação comercial concluída.

## Deploy

Código enviado ao repositório privado `SPGMarcos/Kactus_site`. Criação do serviço Render recusada porque a integração só tem acesso ao SmartControl. O proprietário optou por liberar Kactus_site depois. Nenhum serviço Kactus nem URL onrender.com foi confirmado; não há deploy público a declarar.
