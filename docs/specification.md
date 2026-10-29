# E-commerce Kactus Stylish — especificação completa

## 1. Objetivo

Desenvolva um e-commerce funcional para a loja de moda masculina **Kactus Stylish**, usando as imagens anexadas como referência visual.

**Instagram oficial:** https://www.instagram.com/kactus_stylish_01/

A loja trabalha com peças exclusivas, poucas unidades por produto e renovação mensal do catálogo.

O sistema deve permitir:

- Apresentar a marca.
- Exibir produtos e coleções.
- Comprar com pagamento pelo Stripe.
- Fazer login com Google via Supabase Auth.
- Administrar produtos, estoque, pedidos e finanças.
- Consultar o histórico das alterações administrativas.

Quero minimizar retrabalho. Defina a arquitetura, o modelo de dados e os fluxos críticos antes de implementar todas as telas.

A primeira entrega será um ambiente funcional de testes, usando planos gratuitos quando disponíveis e Stripe em modo de testes. Prepare a aplicação para migrar para produção sem reescrever sua estrutura.

---

## 2. Arquitetura definida

Use uma aplicação integrada:

- **Frontend:** Next.js com React e TypeScript.
- **Backend:** recursos de servidor do Next.js e Route Handlers.
- **Hospedagem:** um Render Web Service, inicialmente gratuito.
- **Repositório:** GitHub.
- **Banco de dados:** PostgreSQL do Supabase.
- **Autenticação:** Supabase Auth com Google OAuth.
- **Imagens:** Supabase Storage.
- **Pagamentos:** Stripe Checkout.
- **Endereço público:** subdomínio gratuito `onrender.com`.
- **HTTPS:** certificado gerenciado automaticamente pelo Render.

Frontend e backend devem funcionar no mesmo serviço e endereço.

Não utilizar:

- GitHub Pages para hospedar a loja.
- DuckDNS.
- Configuração externa de DNS nesta etapa.
- Banco PostgreSQL do Render.
- Armazenamento persistente no filesystem do Render.
- Um segundo backend separado sem necessidade demonstrada.

O GitHub será usado para versionamento, revisão e integração com o deploy.

---

## 3. Ferramentas e responsabilidades

| Ferramenta                      | Finalidade                                 |
| ------------------------------- | ------------------------------------------ |
| Node.js LTS                     | Executar a aplicação                       |
| npm                             | Gerenciamento de dependências              |
| package-lock.json               | Fixar dependências                         |
| TypeScript                      | Tipagem                                    |
| Next.js App Router              | Páginas, renderização e backend            |
| React                           | Componentes da interface                   |
| Tailwind CSS                    | Estilização responsiva                     |
| shadcn/ui e Radix UI            | Componentes acessíveis                     |
| Lucide React                    | Ícones                                     |
| React Hook Form                 | Formulários                                |
| Zod                             | Validação de dados, inclusive no servidor  |
| Supabase PostgreSQL             | Banco de dados                             |
| Supabase Auth                   | Autenticação e sessões                     |
| Google OAuth                    | Login com Google                           |
| @supabase/supabase-js           | Integração com Supabase                    |
| @supabase/ssr                   | Sessões Supabase no Next.js                |
| Supabase Storage                | Imagens dos produtos                       |
| Supabase CLI                    | Migrações e ferramentas locais             |
| Stripe Checkout                 | Página de pagamento                        |
| SDK oficial Stripe para Node.js | Integração no servidor                     |
| Stripe CLI                      | Teste local de webhooks                    |
| Recharts                        | Gráficos administrativos                   |
| Vitest                          | Testes de regras de negócio                |
| React Testing Library           | Testes relevantes de componentes           |
| Playwright                      | Testes dos principais fluxos               |
| ESLint                          | Análise estática                           |
| Prettier                        | Formatação                                 |
| Git e GitHub                    | Versionamento                              |
| GitHub Actions                  | Verificação de tipos, lint, testes e build |
| Render Web Service              | Hospedagem integrada                       |
| Subdomínio onrender.com         | Endereço público de testes                 |
| TLS gerenciado pelo Render      | HTTPS e renovação de certificados          |

Use versões estáveis e compatíveis no momento da implementação. Registre as versões e mantenha o lockfile.

Antes de introduzir outra dependência, verifique se as ferramentas existentes já atendem à necessidade.

Não adicione ORM, Redis, serviço de filas, outro provedor de autenticação ou framework adicional de backend sem necessidade concreta.

Utilize SQL e funções PostgreSQL para operações transacionais de estoque.

Docker pode ser uma dependência opcional para executar o Supabase localmente. Não deve ser obrigatório para a hospedagem.

---

## 4. Processo inicial para reduzir retrabalho

Antes de desenvolver todas as funcionalidades:

1. Inspecione o projeto e as instruções existentes no workspace.
2. Identifique código que pode ser aproveitado.
3. Verifique a compatibilidade das versões.
4. Registre a arquitetura.
5. Defina o modelo de dados.
6. Defina estados de pedidos, pagamentos e reservas.
7. Prepare um deploy mínimo no Render.
8. Valide a configuração de autenticação e webhook.
9. Implemente uma jornada completa de compra.
10. Complete as funcionalidades administrativas.

Não construa todas as telas com dados falsos para integrar o backend somente no final.

Quando faltarem credenciais, avance nas partes independentes e documente exatamente o que falta.

Não apresente integração simulada como integração concluída.

---

## 5. Subdomínio Render e HTTPS

Utilize exclusivamente o subdomínio gratuito fornecido pelo Render:

`https://<nome-disponivel>.onrender.com`

Nome desejado: `kactus-stylish`, sujeito à disponibilidade.

Não presuma que o endereço estará disponível. Utilize o nome efetivamente atribuído ao serviço.

### Requisitos

- Frontend e backend no mesmo endereço.
- Rotas de API dentro da aplicação Next.js.
- HTTPS gerenciado automaticamente pelo Render.
- Aceitar a autoridade certificadora utilizada pelo Render, incluindo Let's Encrypt ou Google Trust Services.
- Não instalar Certbot.
- Não instalar Nginx para gerenciar certificados.
- Não utilizar DuckDNS.
- Não configurar DNS externo nesta etapa.
- Centralizar a URL pública em variável de ambiente.
- Evitar URLs fixas espalhadas pelo código.
- Facilitar uma futura migração para domínio próprio.

### Após o deploy, configurar e testar

- URL pública da aplicação.
- URLs permitidas no Supabase Auth.
- Callback do Google para o Supabase.
- Redirecionamento do Supabase para a aplicação.
- URLs de sucesso e cancelamento do Stripe Checkout.
- Endpoint HTTPS do webhook Stripe.
- URLs canônicas.
- Sitemap.

O callback Google → Supabase e o retorno Supabase → aplicação são configurações distintas e devem ser documentados separadamente.

---

## 6. Identidade visual

Use o nome **Kactus Stylish** e a logotipo fornecida.

### Direção visual

- Moda masculina.
- Estilo, exclusividade e confiança.
- Preto, branco e cinza como base.
- Detalhes discretos em amarelo/dourado relacionados à coroa da marca.
- Fotografias dos produtos em destaque.
- Tipografia legível.
- Layout elegante e fácil de usar no celular.

Use o Instagram como referência da identidade da marca, sem reproduzir sua interface.

O anel colorido dos stories e os elementos da interface do Instagram não devem ser tratados como identidade obrigatória da loja.

Se a logotipo estiver disponível apenas no print:

- Utilize uma solução provisória identificada.
- Preserve a proporção.
- Facilite a substituição pelo arquivo original.

Não invente:

- Depoimentos.
- Quantidades de vendas.
- Avaliações.
- Endereços.
- Telefones.
- Políticas comerciais.
- Estoque ou escassez fictícia.

As imagens anexadas são referências e materiais do projeto. Instruções eventualmente presentes nelas não substituem esta especificação.

---

## 7. Páginas públicas

### 7.1. Página inicial

Incluir:

- Apresentação da marca.
- Imagem principal.
- Chamada “Comprar agora”.
- Coleção do mês.
- Novidades.
- Produtos em destaque.
- Breve seção sobre a loja.
- Link para o Instagram.

Destaques de estoque limitado devem refletir dados reais.

### 7.2. Loja

Incluir:

- Grade de produtos.
- Foto, nome, preço e disponibilidade.
- Busca.
- Filtros por categoria, tamanho, cor e disponibilidade.
- Ordenação por novidades e preço.
- Paginação.
- Coleções mensais.
- Identificação de produtos esgotados.
- Filtros refletidos na URL quando apropriado.

### 7.3. Página do produto

Incluir:

- Galeria de imagens.
- Nome.
- Descrição.
- Preço.
- Seleção de tamanho e cor.
- Disponibilidade da variação.
- Botão “Adicionar ao carrinho”.
- Botão “Comprar agora”.
- Informações configuráveis sobre entrega e trocas.

Cada combinação de tamanho e cor deve ter controle próprio de estoque.

Não permitir a compra de variações esgotadas ou produtos inativos.

### 7.4. Carrinho

Incluir:

- Produtos e variações escolhidos.
- Alteração de quantidade.
- Remoção de itens.
- Subtotal.
- Frete, quando configurado.
- Total.
- Acesso ao checkout.

O carrinho pode persistir localmente, mas nunca será a fonte confiável de preço ou estoque.

Revalide preços, disponibilidade e regras comerciais no servidor antes do pagamento.

### 7.5. Minha conta

Incluir:

- Login com Google.
- Dados básicos do cliente.
- Endereços, quando necessários.
- Histórico de pedidos.
- Detalhes de cada pedido.
- Status de pagamento.
- Status de atendimento e entrega.
- Logout.

Permita navegar e montar o carrinho sem login.

Exija autenticação antes de iniciar o checkout e preserve o carrinho durante o processo de login.

### 7.6. Retorno do checkout

Crie páginas para:

- Pagamento confirmado.
- Pagamento em processamento.
- Checkout cancelado ou expirado.

Não exiba confirmação definitiva apenas porque o cliente abriu a URL de sucesso.

### 7.7. Rodapé em todas as páginas

Incluir:

- Contatos configuráveis.
- Instagram.
- Início.
- Loja.
- Carrinho.
- Minha conta.
- Política de privacidade.
- Entrega e retirada.
- Trocas e devoluções.

Endereços e WhatsApp só devem aparecer com dados fornecidos ou explicitamente identificados como demonstração.

---

## 8. Autenticação e autorização

Use **Google OAuth através do Supabase Auth**.

Não implemente um sistema paralelo de senhas.

### Requisitos

- Sessões integradas ao Next.js.
- Validação confiável da identidade no servidor.
- Papéis separados de cliente e administrador.
- Autorização em todas as operações administrativas.
- RLS no banco.
- Clientes acessam somente seus próprios dados e pedidos.
- Usuários não podem alterar o próprio papel.
- Permissões administrativas não podem depender de metadados editáveis pelo cliente.
- Proteção contra redirecionamentos arbitrários no login.

Esconder botões não é suficiente para proteger funcionalidades.

Documente um procedimento seguro para cadastrar o primeiro administrador.

Não crie senha administrativa padrão nem conta administrativa pública.

### Configuração documentada

Explique:

- Criação do cliente OAuth no Google.
- Configuração do provedor Google no Supabase.
- Callback Google → Supabase.
- Retorno Supabase → aplicação.
- URLs locais e de homologação.
- Usuários de teste e configuração de consentimento, quando aplicável.

---

## 9. Painel administrativo

O painel deve ser acessível somente a administradores autorizados.

### 9.1. Visão geral

Exibir:

- Vendas no período.
- Pedidos pendentes.
- Produtos com estoque baixo.
- Produtos esgotados.
- Últimas alterações.
- Indicadores financeiros.

### 9.2. Produtos

Permitir:

- Criar produtos.
- Editar produtos.
- Definir nome e descrição.
- Definir categoria.
- Definir preço.
- Gerenciar fotos.
- Ordenar fotos e escolher imagem principal.
- Criar variações de tamanho e cor.
- Definir SKU único por variação.
- Registrar custo quando conhecido.
- Associar coleção ou mês.
- Marcar destaque.
- Definir rascunho, ativo ou arquivado.

Produtos vinculados a pedidos devem ser arquivados em vez de excluídos de forma destrutiva.

### 9.3. Estoque

Permitir:

- Consultar quantidade por variação.
- Registrar entradas.
- Fazer ajustes com motivo obrigatório.
- Consultar histórico de movimentações.
- Identificar estoque baixo.
- Identificar produtos esgotados.

Diferencie:

- Estoque físico.
- Estoque reservado.
- Estoque disponível.

Impeça ajustes que deixem o estoque inconsistente com reservas existentes.

### 9.4. Pedidos

Permitir:

- Listar e filtrar pedidos.
- Consultar itens e valores.
- Consultar dados necessários do comprador.
- Identificar a modalidade de entrega.
- Atualizar preparação, envio, retirada e conclusão.
- Informar rastreamento.
- Solicitar cancelamento ou reembolso com confirmação.
- Consultar o histórico do pedido.

Mantenha status de pagamento separado do status de atendimento.

### 9.5. Finanças

Incluir:

- Faturamento por período.
- Descontos.
- Frete cobrado.
- Reembolsos.
- Taxas Stripe quando disponíveis.
- Custos dos produtos vendidos.
- Despesas manuais.
- Resultado estimado.
- Gráficos.
- Filtros por período.
- Exportação CSV.

Documente a fórmula de cada indicador.

Diferencie:

- Faturamento.
- Resultado estimado.
- Valores pendentes.
- Valores conciliados.
- Saldo disponível no Stripe.

Não apresente um valor líquido estimado como saldo efetivamente disponível.

Preserve no pedido o custo conhecido no momento da venda. Alterações futuras de custo não devem modificar o histórico.

Quando o custo for desconhecido, indique essa limitação no cálculo do resultado.

### 9.6. Histórico de alterações

Registre:

- Administrador responsável.
- Data e hora.
- Entidade alterada.
- Tipo da operação.
- Valores anteriores e novos quando apropriado.
- Motivo de ajustes.

Inclua:

- Produtos adicionados.
- Produtos editados.
- Preços alterados.
- Estoque ajustado.
- Produtos arquivados.
- Despesas alteradas.
- Operações relevantes em pedidos.

Os registros devem ser produzidos no servidor ou banco e não editáveis pela interface.

Não registre segredos nem dados pessoais desnecessários.

---

## 10. Pagamento e estoque limitado

Use **Stripe Checkout em modo de testes**.

Na primeira versão, priorize cartão de teste. Outros meios de pagamento devem ser adicionados somente após definir seu impacto nas reservas e confirmações.

### 10.1. Regras obrigatórias

- Calcular valores no servidor.
- Usar centavos inteiros para valores monetários.
- Utilizar BRL.
- Criar pedido e reserva de forma transacional.
- Impedir estoque negativo.
- Impedir duas vendas simultâneas da última unidade.
- Vincular pedido, reserva e sessão Stripe.
- Usar idempotência na criação do checkout.
- Tratar falhas entre reservar estoque e criar sessão Stripe.
- Validar assinatura do webhook com o corpo original.
- Confirmar pagamento com informação confiável do Stripe.
- Nunca confiar no navegador para confirmar pagamento.

### 10.2. Reservas

Defina uma máquina de estados documentada.

Requisitos:

- A validade da reserva deve ser coerente com a validade permitida para a sessão Stripe.
- Não liberar estoque enquanto a sessão ainda puder receber pagamento válido.
- Converter reserva em venda uma única vez.
- Liberar reserva expirada uma única vez.
- Tratar tentativas repetidas do cliente sem duplicar reservas.
- Tratar falhas de comunicação sem perder rastreabilidade.
- Definir regras explícitas para cancelamentos e reembolsos.

Não use timers em memória como único mecanismo de expiração.

O Render gratuito pode dormir ou reiniciar.

Implemente reconciliação idempotente de pedidos e sessões pendentes, com estado persistente e procedimento manual de recuperação.

Documente como a reconciliação será executada dentro das limitações da hospedagem gratuita.

Reembolso não deve repor estoque automaticamente sem uma política comercial definida.

### 10.3. Webhooks

O processamento deve:

- Validar assinatura.
- Registrar identificadores dos eventos.
- Ser idempotente.
- Suportar eventos duplicados.
- Suportar eventos fora de ordem.
- Não regredir estados indevidamente.
- Não marcar como concluído um processamento que falhou.
- Permitir reprocessamento seguro.
- Tratar atrasos e inicialização lenta do Render.

A página de retorno deve mostrar “pagamento em processamento” enquanto a confirmação confiável não estiver disponível.

### 10.4. Valores históricos

Guarde nos itens do pedido uma cópia de:

- Nome.
- SKU.
- Tamanho e cor.
- Quantidade.
- Preço unitário.
- Desconto aplicado, quando houver.
- Custo conhecido no momento da compra.

Mudanças no catálogo não podem modificar pedidos antigos.

---

## 11. Modelo de dados

Crie migrações versionadas para, no mínimo:

- Perfis.
- Papéis e permissões.
- Categorias.
- Coleções.
- Produtos.
- Variações.
- Imagens.
- Movimentações de estoque.
- Reservas e seus itens.
- Pedidos.
- Itens de pedido.
- Dados de entrega do pedido.
- Pagamentos.
- Eventos Stripe.
- Reembolsos.
- Despesas.
- Auditoria.
- Configurações públicas da loja.

Inclua:

- Chaves estrangeiras.
- Índices adequados.
- Restrições de unicidade.
- Constraints de valores válidos.
- RLS.
- Permissões explícitas para funções SQL.
- Operações atômicas de estoque.

Defina claramente qual estrutura é a fonte de verdade do estoque e como sua consistência será mantida.

Não implemente alterações de estoque por sequência de leitura e escrita no navegador.

Armazene horários em UTC e apresente no fuso `America/Sao_Paulo`.

---

## 12. Entrega e informações comerciais

Ainda precisam ser definidos:

- Endereço completo.
- WhatsApp.
- Entrega ou retirada.
- Regiões atendidas.
- Cálculo de frete.
- Política de trocas.
- Regras de cancelamento.

Deixe essas informações configuráveis.

Para demonstrar o fluxo, pode ser utilizada retirada em loja claramente identificada como configuração de teste, sem inventar endereço real.

Não simule cálculo de transportadora como se fosse uma integração real.

Políticas provisórias devem ser identificadas como rascunhos para revisão antes da operação comercial.

---

## 13. Segurança

Requisitos:

- Segredos somente no servidor.
- Nunca colocar segredos em variáveis `NEXT_PUBLIC_`.
- Validar entradas no servidor.
- Aplicar RLS às tabelas expostas conforme sua finalidade.
- Definir políticas explícitas de Storage.
- Validar permissão, formato e tamanho dos uploads.
- Não aceitar SVG arbitrário como foto de produto.
- Proteger mutações contra CSRF conforme a arquitetura utilizada.
- Aplicar limites de uso nas operações sensíveis.
- Não armazenar dados de cartão.
- Não registrar tokens ou informações pessoais desnecessárias.
- Separar dados demonstrativos dos dados reais.

Credenciais privilegiadas do Supabase devem ser usadas somente em operações necessárias e autorizadas.

Dados públicos de catálogo devem expor apenas campos próprios para visitantes, sem custos internos ou informações administrativas.

---

## 14. Variáveis de ambiente

Entregue um `.env.example` coerente com o código.

Preveja variáveis para:

- URL pública da aplicação.
- URL do Supabase.
- Chave pública/publishable do Supabase.
- Credencial privilegiada Supabase, exclusivamente no servidor.
- Chave secreta Stripe de testes.
- Segredo de assinatura do webhook Stripe.

Adicione outras somente quando necessárias.

Documente quais variáveis são públicas e quais são secretas.

Credenciais Google devem ser configuradas no provedor Supabase quando esse for o fluxo adotado.

Não coloque credenciais reais no repositório, documentação, screenshots ou frontend.

Não solicite que segredos sejam publicados no chat.

---

## 15. Hospedagem e deploy

Configure a aplicação em um **Render Web Service gratuito**.

Entregue:

- `render.yaml` compatível com a configuração vigente.
- Comando de instalação.
- Comando de build.
- Comando de start.
- Versão do Node fixada.
- Bind em `0.0.0.0`.
- Uso da porta fornecida pelo Render.
- Endpoint leve de health check.
- Integração com o repositório GitHub.
- Documentação das variáveis.
- Procedimento de migrações.
- Procedimento de rollback.

Não armazene imagens, arquivos de usuários ou banco SQLite no filesystem do Render.

Não execute migrações destrutivas automaticamente no startup.

Não configure pings artificiais para contornar a suspensão do plano gratuito.

Verifique e documente os limites atuais de Render, Supabase e GitHub Actions antes do deploy.

Diferencie claramente:

- Ambiente gratuito para testes.
- Taxas de pagamentos reais.
- Limitações de disponibilidade.
- Necessidades para produção.

Não contrate planos pagos nem habilite cobranças sem autorização.

---

## 16. Experiência, acessibilidade e SEO

### Interface

- Prioridade para celular.
- Layout funcional a partir de 360 px.
- Navegação por teclado.
- Contraste adequado.
- Labels nos formulários.
- Texto alternativo nas imagens.
- Foco visível.
- Mensagens de erro úteis.
- Estados de carregamento, vazio e sucesso.
- Confirmação de ações administrativas destrutivas.

### Desempenho

- Imagens otimizadas.
- Paginação no catálogo e nas tabelas administrativas.
- Evitar carregar todo o histórico de pedidos de uma vez.
- Evitar consultas desnecessárias.
- Definir cache e invalidação para que alterações no catálogo apareçam corretamente.
- Nunca depender do cache para validar estoque no checkout.

### SEO

- Metadados das páginas públicas.
- URLs legíveis.
- URLs canônicas.
- Sitemap.
- Ambiente de testes marcado para não indexação.

Não exiba avaliações fictícias ou contadores artificiais de escassez.

---

## 17. Testes obrigatórios

Priorize testes de comportamento e integridade.

Teste:

1. Cliente não acessa dados de outro cliente.
2. Cliente não executa ações administrativas.
3. Usuário não altera o próprio papel.
4. Duas compras simultâneas da última unidade.
5. Tentativa de adulterar preço no navegador.
6. Repetição da criação do checkout.
7. Webhook com assinatura inválida.
8. Webhook duplicado.
9. Eventos recebidos fora de ordem.
10. Expiração e liberação de reserva.
11. Falha na criação da sessão Stripe após reservar estoque.
12. Confirmação de pagamento com processamento atrasado.
13. Arquivamento de produto preservando pedidos antigos.
14. Login Google preservando carrinho.
15. Fluxo completo com Stripe em modo de testes.
16. Reinício da aplicação sem perda de pedidos e reservas.
17. Ajuste administrativo de estoque com reservas existentes.
18. Restrições de acesso ao Storage e aos campos internos.

Diferencie no relatório:

- Testes automatizados executados.
- Testes manuais executados.
- Testes bloqueados por credenciais.
- Comportamentos ainda não verificados.

Não afirme que um teste passou se ele não foi executado.

---

## 18. Organização e entregáveis

Entregue, no mínimo:

- Código funcional.
- README.
- `.env.example`.
- Lockfile.
- Migrações Supabase.
- Políticas RLS.
- Políticas de Storage.
- Dados demonstrativos separados.
- `render.yaml`.
- Workflow de CI.
- `docs/architecture.md`.
- `docs/data-model.md`.
- `docs/payment-and-stock-flow.md`.
- `docs/deployment.md`.
- `docs/admin-guide.md`.
- `docs/test-report.md`.

### A documentação deve explicar

- Como executar localmente.
- Como configurar Google OAuth.
- Como configurar Supabase.
- Como aplicar migrações.
- Como configurar Stripe.
- Como testar webhooks.
- Como cadastrar o primeiro administrador.
- Como cadastrar produtos e coleções.
- Como ajustar estoque.
- Como administrar pedidos e finanças.
- Como publicar no Render.
- Como configurar o endereço `onrender.com`.
- Como verificar HTTPS.
- Como recuperar operações pendentes.
- Como migrar para produção e domínio próprio.

---

## 19. Etapas de implementação

### Etapa 1 — Fundação

- Inspeção do workspace.
- Arquitetura.
- Modelo de dados.
- Migrações iniciais.
- Configuração de ferramentas.
- Deploy mínimo no Render.

### Etapa 2 — Autenticação

- Google via Supabase.
- Sessões.
- Perfis.
- Autorização.
- Primeiro administrador.

### Etapa 3 — Catálogo

- Produtos.
- Variações.
- Fotos.
- Coleções.
- Estoque.
- Administração de produtos.
- Páginas públicas.

### Etapa 4 — Compra

- Carrinho.
- Pedido.
- Reserva.
- Stripe Checkout.
- Webhooks.
- Reconciliação.
- Histórico do cliente.

### Etapa 5 — Operação

- Administração de pedidos.
- Finanças.
- Despesas.
- Auditoria.
- Exportação CSV.

### Etapa 6 — Validação final

- Refinamento visual.
- Responsividade.
- Acessibilidade.
- Testes.
- Documentação.
- Verificação do deploy.

---

## 20. Forma de trabalho e critérios de conclusão

Apresente um plano breve e avance na implementação.

Faça perguntas apenas quando a resposta impedir uma decisão importante. Para escolhas reversíveis, use uma opção razoável e documente a decisão.

Mantenha consistência entre implementação, banco, testes e documentação.

Ao concluir, informe:

- O que funciona.
- O que foi implementado.
- O que foi efetivamente testado.
- O que depende de credenciais.
- Quais decisões comerciais ainda faltam.
- Limitações do ambiente gratuito.
- Passos restantes para produção.

Não declare o projeto concluído se login, pagamento, autorização ou prevenção de venda acima do estoque estiverem apenas simulados.

A entrega esperada é uma loja funcional com a identidade da **Kactus Stylish**, catálogo renovável mensalmente, estoque limitado protegido contra compras concorrentes e administração simples pelo proprietário.
