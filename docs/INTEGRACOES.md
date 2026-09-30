# Integração com jogos de fornecedores

## Estado atual: preparada, não conectada

A estrutura inclui PG Soft e Pragmatic Play no registro de fornecedores. **Nenhuma API de jogos desses fornecedores foi autenticada ou conectada.** As fichas locais só pertencem aos dois jogos originais Aurora.

A aplicação oferece links para páginas demonstrativas oficiais, abertos no site do fornecedor. Isso não é incorporação dos jogos nem integração de API. Não há parceria, licença ou autorização de distribuição implícita pelo uso desses links.

Fontes oficiais consultadas:

- PG Soft: https://www.pgsoft.com/demo
- Pragmatic Play, demonstrações: https://www.pragmaticplay.com/en/games/?type=demo
- Pragmatic Play, oferta de API: https://www.pragmaticplay.com/en/

## O que falta para conectar

1. Documentação oficial atual ou documentação do agregador autorizado contratado.
2. Acesso sandbox/demo autorizado para este projeto e credenciais fornecidas por canal seguro.
3. Lista de jogos liberados, identificadores, domínios e regras de incorporação.
4. Especificações de autenticação, lançamento, expiração, limites e eventuais callbacks.

Não envie chaves na conversa, coloque-as no código ou publique-as no GitHub. Configure segredos diretamente no ambiente do servidor escolhido. Os nomes das variáveis e o método de assinatura devem ser definidos a partir do contrato real do fornecedor; não há chave genérica criada nesta versão.

## Contrato interno já preparado

| Rota | Função | Estado atual |
| --- | --- | --- |
| `GET /api/providers` | Lista pública de fornecedores e disponibilidade | Funciona, sem retornar credenciais. |
| `POST /api/demo-sessions` | Ponto de entrada reservado para lançar uma demo | Valida o pedido e retorna `503 PROVIDER_NOT_CONFIGURED`. |

Exemplo de corpo **interno Aurora**, não da API da PG:

```json
{"providerId":"pg-soft","gameId":"identificador-autorizado","mode":"demo"}
```

Um pedido com `mode: "real"` é rejeitado. A ausência de documentação ou de adaptador jamais deve desviar para uma API alternativa. O servidor limita o corpo a 2 KiB, exige JSON, bloqueia origens cruzadas e não permite informar URL de destino.

## Fluxo previsto após autorização

O navegador envia apenas o identificador autorizado do jogo ao backend. O adaptador do backend usa suas credenciais para pedir uma sessão de teste ao fornecedor. O servidor valida a resposta e devolve apenas os dados mínimos para abrir o jogo. O jogo de terceiro controla seu próprio saldo de demonstração; ele não recebe o saldo editável do Aurora.

Antes de ativar o adaptador, implementar e testar: origem pública HTTPS explícita (sem confiar em cabeçalhos de proxy não verificados), sessão/autorização do visitante conforme o contrato, limites de requisições, timeout, respostas limitadas, erros sem segredos, destinos HTTPS em lista permitida e política de iframe validada pelo fornecedor. Callbacks, se exigidos, precisam de assinatura, proteção contra repetição e idempotência conforme a documentação.

O código atual de origem HTTP é somente para o servidor local. Não é um gateway de produção. A arquitetura continua estritamente demonstrativa e não inclui carteira financeira, pagamentos ou apostas reais.

## Build estático versus backend

`npm run dev` serve a interface e as duas rotas de preparação. `npm run build` gera somente a interface estática: os jogos locais e os links oficiais funcionam, mas as rotas `/api/` exigem um backend separado. Quando houver acesso ao fornecedor, escolha uma hospedagem de backend e atualize os cabeçalhos de acordo com os domínios efetivamente autorizados.
