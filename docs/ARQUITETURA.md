# Entendendo o Aurora Casino

## Por que usar módulos

O navegador carrega `app.js` como um módulo. Ele importa regras de `games.js`, estado de `store.js` e desenho de `wheel.js`. Essa separação permite testar a matemática sem abrir uma página e mudar o visual sem reescrever os pagamentos.

A escolha de JavaScript sem framework mantém o projeto pequeno e sem instalações externas. Ela também torna visíveis os fundamentos: eventos, DOM, estado, assincronismo e testes. Um framework pode ser introduzido depois sem descartar as funções de regras.

## Responsabilidades

| Camada | Recebe | Entrega |
| --- | --- | --- |
| Interface | Cliques, valor da aposta e seleção | Controles, animações, histórico e mensagens |
| Regras | Jogo, escolha, valor, saldo e gerador aleatório | Resultado, retorno, lucro líquido e saldo novo |
| Estado | Resultado validado e estado anterior | Nova sessão e histórico de até 30 rodadas |
| Persistência | Sessão validada | JSON sob a chave `aurora-casino:v1` |

Os jogos locais não enviam resultados a um servidor. O servidor fornece HTML, CSS, JavaScript e duas rotas de preparação para fornecedores, descritas em `INTEGRACOES.md`. Nenhuma API externa está conectada.

## Estado e persistência

Uma sessão contém `version`, `balance`, `rounds` e `history`. A versão permite evoluir o formato no futuro. Cada registro guarda o jogo, escolha, resultado, aposta, retorno, lucro, saldo e horário ISO.

Ao carregar a página, `loadState()` tenta ler o armazenamento. O código valida tipos, intervalos e a coerência dos pagamentos de cada registro. Se os dados não forem válidos, inicia uma sessão limpa e mostra um aviso. Se o navegador bloquear a gravação, a aplicação continua em memória.

Essa validação protege a estabilidade da interface. Ela não prova que o saldo é legítimo: o usuário controla o navegador, o código e o armazenamento. Não há promessa de proteção contra adulteração de fichas fictícias.

## Aleatoriedade

`randomInt(max)` usa um inteiro de 32 bits de Web Crypto. Se esse inteiro cair na parte final do intervalo que não forma grupos completos de `max`, sorteia novamente. Só depois aplica `% max`. Assim, cada resultado do intervalo recebe a mesma quantidade de valores de origem.

Os testes injetam um gerador determinístico. Por exemplo, um gerador que retorna `1` testa uma vitória em vermelho sem depender de sorte. A interface real não oferece controle sobre esse gerador.

## Animação e consistência

O resultado é calculado e persistido antes da animação. `rotationFor()` transforma o número sorteado no ângulo correspondente à ordem física da roda. A animação representa o resultado; ela não o calcula. A preferência de movimento reduzido pula o movimento longo.

`busy` bloqueia ações concorrentes na mesma aba. A API Web Locks, quando suportada, serializa a atualização local entre abas da mesma origem. O evento `storage` atualiza a tela quando outra aba muda a sessão. Sem Web Locks, cliques simultâneos em abas diferentes não têm garantia transacional; esse limite é aceitável apenas para esta demo.

## Como estudar e alterar

1. Leia `index.html` para localizar a mesa, formulário, histórico e diálogos.
2. Siga os eventos registrados em `app.js` para acompanhar uma rodada.
3. Leia `playRound()` em `games.js` e altere uma regra junto de seu teste.
4. Execute `npm test` para verificar a regra independentemente da interface.
5. Ajuste cores e espaçamento em `styles.css`; confira no celular e com teclado.
6. Execute `npm run check` e `npm run build` antes de publicar.

Para adicionar um jogo, implemente primeiro suas regras, casos de teste e probabilidades. Depois conecte a interface e atualize a validação do histórico. Não adicione pagamentos reais a esta arquitetura.
