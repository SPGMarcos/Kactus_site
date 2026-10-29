# Administração

## Primeiro administrador

Habilite Google OAuth e faça um login com a conta do proprietário. No Supabase Authentication confirme o UUID e e-mail da pessoa. Pelo SQL Editor, com acesso de proprietário, execute `insert into public.user_roles(user_id,role) values ('UUID_VERIFICADO','admin');`. Esse passo é privilegiado e não deve ser oferecido a clientes. Nenhum usuário pode editar seu próprio papel. Acesse `/admin` com essa conta. Não foi criado administrador público nem senha padrão.

## Catálogo

Em Produtos crie categoria e coleção (use o primeiro dia do mês), depois produto em rascunho. Preço em centavos: 12990 = R$ 129,90. Defina categoria/coleção, descrição e destaque. Cadastre variações de tamanho/cor com SKU único. Custo vazio significa desconhecido, não custo zero. Em Estoque registre a entrada inicial com motivo; quantidade disponível é físico menos reservado. Ative o produto somente após revisar fotos e informações.

Fotos: PNG/JPEG/WebP, até 5 MB; descrição acessível e ordem (0 = principal). Arquivos ficam no Storage. Altere ordem e texto por Ordenar fotos. Arquive produtos que saíram de linha; pedidos mantêm snapshots. Não excluir diretamente produtos referenciados.

## Estoque e pedidos

Ajustar estoque usa delta positivo/negativo e motivo obrigatório. Ajustes abaixo das reservas são recusados. Histórico de movimentações é produzido pelo banco. Em Pedidos veja itens e pagamento; só avance atendimento de pedidos pagos. Informe preparação, pronto para retirada, enviado/rastreio e concluído. Cancelar expira a sessão Stripe; pagamento já concluído exige reembolso. Reembolso integral tem confirmação explícita e chave idempotente. Reposição física após devolução exige ajuste independente e motivo.

## Reconciliação

Execute Reconciliar pedidos e taxas após falhas, reinícios ou atrasos. Lotes de 25 pedidos pendentes e 25 pagamentos sem taxas. Pedidos sem sessão fazem consulta paginada Stripe por metadata.order_id. Nenhuma reserva é liberada enquanto uma sessão puder receber pagamento. Se não existir sessão após o prazo de criação mais 5 minutos e a consulta completa ao Stripe tiver sucesso, a reserva sem sessão pode ser liberada atomicamente. Erros de conexão mantêm a reserva. Não limpar reserved manualmente.

Reprocessar um webhook pelo Dashboard Stripe é seguro. Confira status do evento, pedido, sessão, valor e moeda. Um evento com erro retorna HTTP 500 para retry. Falha financeira após baixar estoque pode ser repetida sem nova baixa.

## Finanças

Relatório agregado no banco para todo o período, em America/Sao_Paulo. Faturamento bruto = soma dos subtotais dos pedidos pagos; descontos e frete separados. Resultado estimado = total pago − reembolsos − custos históricos conhecidos − taxas conhecidas − despesas do período. Custo desconhecido e taxa pendente são sinalizados. Reembolso não altera automaticamente o custo ou o estoque; o resultado é conservador até a política de devoluções ser definida. O recorte usa a data do pedido para vendas/reembolsos relacionados, não um regime contábil de caixa por data de estorno.

Valores conciliados são pagamentos cujo balance_transaction foi obtido do Stripe, não saldo bancário disponível. Exportação CSV percorre todo o período em lotes sem limitar aos registros visíveis. Despesas são editáveis com auditoria. Histórico é somente leitura, produzido no servidor/banco.

## Configurações comerciais

Preencha WhatsApp, endereço e políticas aprovadas. As políticas iniciais são rascunhos. O modo de retirada é explicitamente de teste e não inventa endereço. Não publicar dados pessoais ou segredos em configurações públicas.
