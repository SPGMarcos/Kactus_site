# Pagamento e estoque

Reserva: active → consumed ou released. Pedido: pending → paid ou expired; paid → partially_refunded/refunded. Atendimento: pending → preparing → shipped/ready → completed. Reembolso não repõe estoque. Ajustes exigem motivo.

Criação usa chave UUID por tentativa e usuário; o banco bloqueia a chave e as variações em ordem consistente. Itens repetidos são agregados. Preços do navegador são recusados pelo schema; valores vêm do banco. A sessão tem expiração fixa de 60 minutos a partir da reserva e cartão como único método, conforme a especificação. Retentativas usam os mesmos parâmetros e a mesma chave Stripe.

Falha de rede após criar sessão é ambígua: manter reserva e tentar novamente a mesma chave e parâmetros. A partir de 25 minutos, a reconciliação procura sessões Stripe por metadata.order_id, com paginação completa. Não tenta criar outra sessão nessa fase. Uma sessão open nunca libera estoque. expired libera uma vez. complete só baixa estoque quando payment_status=paid e valor/moeda/pedido conferem. Sem sessão encontrada, a liberação só ocorre depois da validade original de 60 minutos mais margem de 5 minutos, após consulta Stripe completa e bem-sucedida; nessa altura a sessão já não pode ser criada com o expires_at original. Falhas na consulta mantêm a reserva.

Webhook valida assinatura com corpo bruto e processa dentro da transação que registra o ID. Erros não são marcados processados. Eventos atrasados não revertem estado pago. A API consulta novamente o Stripe para obter estado atual.

Reconciliação: ação protegida no painel, lotes limitados. Executar após falhas e ao operar a loja; o webhook é a via normal. Não há timer em memória nem pings para impedir suspensão. Para automatizar em produção, usar agendamento durável autorizado. Recuperação manual: consultar sessão por metadata.order_id, vincular via processo de reconciliação, conferir valores, reaplicar evento pelo Stripe. Nunca ajustar reserved diretamente.
