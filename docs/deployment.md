# Configuração e deploy

## Variáveis

Públicas (embutidas no build): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. A primeira é a URL real atribuída pelo Render. A última é a chave publishable, nunca service_role.

Secretas, somente servidor: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Use `.env.local` ignorado pelo Git localmente e Environment no Render. Nunca enviar no chat ou em commits. `APP_ENV=test` exige chave Stripe de teste. A chave Supabase secret/service_role deve pertencer exclusivamente ao projeto da loja.

## Supabase

Projeto `cmnwqdcxhibtmqhmdtju` criado separado dos projetos SmartControl. Migrações em `supabase/migrations/`. Para um ambiente novo: `npx supabase --help`, `npx supabase login`, `npx supabase link --project-ref SEU_REF`, confira `npx supabase db push --help` e aplique `npx supabase db push`. Não executar migrações no startup. Faça backup antes de evoluir o esquema.

Bucket `products`: público para fotos comerciais, limite 5 MB, PNG/JPEG/WebP. Escrita de administradores. Upload do app valida tamanho, MIME, assinatura binária e usa UUID. Não colocar dados pessoais nesse bucket.

## Google OAuth — dois redirecionamentos diferentes

1. Crie um projeto Google Cloud e a tela de consentimento. Configure o público e usuários de teste conforme sua conta.
2. Crie um cliente OAuth tipo aplicação web. **Google → Supabase**: URI de redirecionamento autorizado `https://cmnwqdcxhibtmqhmdtju.supabase.co/auth/v1/callback`.
3. No Supabase, Authentication → Sign In / Providers → Google, habilite o provedor e configure Client ID/Client Secret do Google. Não colocar o segredo Google no Next.js.
4. **Supabase → aplicação**: configure Site URL como a URL real Render e adicione `http://localhost:3000/auth/callback` e `https://URL-REAL.onrender.com/auth/callback` às Redirect URLs. O app adiciona `next` seguro para voltar ao carrinho/admin.
5. Teste login, atualização de sessão e logout. Não usar senha administrativa padrão. O carrinho permanece no navegador após login.

## Stripe (ainda depende de conta)

Crie uma conta/sandbox Stripe. Não habilite cobranças reais. Configure chave de teste no ambiente. A integração usa Checkout hospedado BRL e `allowed_payment_method_types: ['card']` na versão atual do SDK, para limitar esta etapa a cartão. Webhook obrigatório: `/api/stripe/webhook` com eventos checkout.session.completed, checkout.session.expired, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, refund.created, refund.updated, refund.failed e charge.refunded.

Localmente: instale a CLI oficial, autentique, rode `stripe listen --forward-to localhost:3000/api/stripe/webhook`; guarde o `whsec_...` em `.env.local`. No Render, crie endpoint HTTPS com a URL real e guarde o segredo específico desse endpoint. O segredo da CLI não substitui o do endpoint hospedado. Teste cartão 4242 4242 4242 4242, validade futura e CVC de teste apenas no sandbox. A página de retorno não confirma pagamentos.

## Render e GitHub

Repositório privado `SPGMarcos/Kactus_site`, branch main. Serviço Node gratuito, build `npm ci && npm run build`, start `npm start`, health `/api/health`. Node fixado em 24.14.0; servidor em 0.0.0.0 e porta `PORT` (3000 local). Use `render.yaml` como configuração desejada; segredos são preenchidos no Dashboard, nunca valores no YAML. A criação por conector e o Blueprint não devem gerenciar serviços duplicados.

No Dashboard conecte o repositório privado caso a integração GitHub ainda não tenha acesso. Use apenas o subdomínio realmente atribuído pelo Render, sem presumir disponibilidade de `kactus-stylish`. Atualize `NEXT_PUBLIC_SITE_URL`, refaça build e configure os callbacks acima. HTTPS é gerenciado pelo Render; sem Certbot, Nginx ou DNS externo. Verifique `/api/health` via HTTPS e navegação sem aviso de certificado.

Rollback: selecione um deploy anterior no Render (plano gratuito limita histórico). SQL exige migração corretiva compatível; não reverter/apagar pedidos. Compare versão de esquema e código antes de restaurar. Mantenha snapshots/backup externo antes de produção.

## Limites consultados em 29/10/2026

- [Render Free](https://render.com/docs/free): dorme após 15 minutos sem tráfego; inicialização pode levar cerca de um minuto; filesystem efêmero; horas gratuitas compartilhadas por workspace. Os serviços existentes também consomem a franquia. Sem pings artificiais.
- [Supabase Free](https://supabase.com/pricing): 500 MB de banco, 1 GB Storage, 5 GB egress, 50 mil usuários ativos/mês; limite de dois projetos ativos e pausa após uma semana inativo. Confirmar uso atual no painel antes de produção.
- [GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions): runners padrão em repositórios públicos são gratuitos; em privados, uso e armazenamento obedecem à franquia do plano. Verifique orçamento e não habilite excedentes pagos sem autorização.
- [Blueprint](https://render.com/docs/blueprint-spec) e [variáveis](https://render.com/docs/configure-environment-variables): `sync: false` pede segredos na criação; alterações posteriores exigem atualização explícita e rebuild/deploy.

Pagamentos reais geram taxas Stripe e dependem do cadastro comercial. Ambiente gratuito serve para testes, sem garantia de disponibilidade adequada a vendas.

## Produção

Antes de abrir vendas: cadastrar produtos e fotos reais; revisar políticas, dados legais e privacidade; definir entrega/frete/cancelamentos; configurar Google e Stripe; executar todos os testes bloqueados; validar permissões, backups, observabilidade e rotina de conciliação. O checkout bloqueia `APP_ENV=production` enquanto existir somente retirada de teste. Implementar a modalidade comercial no cálculo de servidor antes de remover esse bloqueio. Domínio próprio futuro depende apenas da URL central, callbacks e configuração do provedor.
