# ✦ Aurora Casino

Uma experiência de cassino **100% demonstrativa**, desenvolvida para o portfólio de Artur (`manoel-arthur`). Roleta europeia e slots com fichas fictícias, interface responsiva e regras testáveis.

Não há dinheiro real, depósitos, saques, pagamentos, contas ou prêmios monetários. O saldo existe somente no navegador do visitante.

## O que já funciona

- Roleta europeia com 37 casas e apostas em vermelho, preto ou zero.
- Área de fornecedores PG Soft e Pragmatic Play, com links oficiais e integração autenticada ainda pendente.
- Slots de três cilindros e quatro símbolos, com tabela de retornos visível.
- Saldo inicial de 1.000 fichas e apostas inteiras de 10 a 500.
- Últimas rodadas, persistência local e reinício com confirmação.
- Animação alinhada ao resultado, modo de movimento reduzido e navegação por teclado.
- Interface em português para celular e computador.
- Testes de regras, persistência e servidor; verificações automáticas no GitHub Actions.

## Executar no computador

Você precisa do **Node.js 22 ou superior**. O projeto não usa dependências npm externas, portanto não exige `npm install`.

1. Extraia o ZIP ou clone `https://github.com/manoel-arthur/aurora-casino.git`.
2. Abra um terminal na pasta `aurora-casino`.
3. Execute:

```bash
npm run dev
```

4. Abra `http://127.0.0.1:4173`.

Use `Ctrl+C` para encerrar. Abrir o HTML diretamente com `file://` não é suportado, porque o projeto usa módulos JavaScript.

## Como foi organizado

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura semântica, formulários, diálogos e regiões acessíveis. |
| `src/styles.css` | Identidade visual, responsividade, estados de foco e animações. |
| `src/app.js` | Eventos, seleção de jogo, controle de rodada e atualização da tela. |
| `src/games.js` | Sorteios, validação, regras de vitória e cálculo dos retornos. |
| `src/store.js` | Estado da sessão, validação dos dados locais e histórico limitado. |
| `src/wheel.js` | Desenho da roleta e cálculo da rotação para cada casa. |
| `scripts/server.mjs` | Servidor local limitado aos arquivos públicos. |
| `scripts/security.mjs` | Política de conteúdo e cabeçalhos de proteção. |
| `scripts/build.mjs` | Montagem da versão estática em `dist/`. |
| `server/` | Registro de fornecedores e contrato interno reservado para sessões demo; APIs externas ainda não conectadas. |
| `docs/INTEGRACOES.md` | Requisitos e limites para uma integração oficial futura. |
| `tests/` | Testes automatizados usando o executor nativo do Node. |
| `.github/workflows/ci.yml` | Verificações em pushes e pull requests. |
| `docs/ARQUITETURA.md` | Fluxo explicado e decisões de implementação. |
| `SECURITY.md` | Proteções, limites de confiança e cuidados ao publicar. |

## Como uma rodada funciona

1. A interface recebe o valor e a escolha do jogador.
2. O valor precisa ser inteiro, estar entre 10 e 500 e caber no saldo.
3. `crypto.getRandomValues()` sorteia números usando rejeição para evitar viés de módulo.
4. O módulo de regras calcula o retorno. A fórmula é `saldo novo = saldo anterior − aposta + retorno`.
5. Saldo e histórico são salvos juntos **antes da animação**. Recarregar a página não desfaz a rodada.
6. A roleta aponta para o número sorteado; os slots mostram os símbolos sorteados.

O botão fica bloqueado durante a rodada. Quando disponível no navegador, Web Locks também serializa transações entre abas. Isso melhora a consistência local; não transforma o navegador em uma autoridade confiável.

## Regras e probabilidades

### Roleta

| Aposta | Casas vencedoras | Chance | Retorno total |
| --- | ---: | ---: | ---: |
| Vermelho | 18 | 18/37 ≈ 48,65% | 2× |
| Preto | 18 | 18/37 ≈ 48,65% | 2× |
| Zero | 1 | 1/37 ≈ 2,70% | 36× |

O retorno inclui a aposta. Apostar 50 e ganhar no vermelho retorna 100: o lucro é 50. Se sair zero, vermelho e preto perdem. O retorno médio teórico é 36/37 ≈ 97,30% para cada opção; isso não garante o resultado de uma sessão.

### Slots

Cada cilindro tem quatro símbolos equiprováveis. São 64 combinações possíveis; apenas quatro trios iguais pagam.

| Combinação | Chance | Retorno total |
| --- | ---: | ---: |
| ★ ★ ★ | 1/64 | 20× |
| ◆ ◆ ◆ | 1/64 | 12× |
| ♠ ♠ ♠ | 1/64 | 8× |
| ● ● ● | 1/64 | 5× |

Chance de qualquer prêmio: 4/64 = 6,25%. Retorno médio teórico: (20 + 12 + 8 + 5)/64 = 70,3125%. A tabela é própria desta demo e não foi calibrada para uso comercial.

## Verificação

```bash
npm run check
npm test
npm run build
```

Os testes verificam todas as casas da roleta e as 64 combinações dos slots, alinhamento visual da roda, retornos, saldo insuficiente, valores inválidos, overflow, dados corrompidos, histórico limitado, métodos HTTP e proteção dos arquivos locais.

Não há dependências npm de produção ou desenvolvimento. As Actions externas estão fixadas por hash de commit e têm permissões mínimas; Dependabot pode propor atualizações mensais.

## Publicação

`npm run build` cria somente os arquivos públicos em `dist/`. Sirva essa pasta por HTTPS em um host estático. O arquivo `_headers` inclui a política de conteúdo e outras proteções para provedores que entendem esse formato.

**Confira os cabeçalhos no host escolhido.** GitHub Pages não aplica `_headers`; publicar lá exige avaliar essa limitação. O servidor de desenvolvimento inclui os cabeçalhos e aceita conexões locais por padrão. Ele não é um serviço de apostas nem um backend de produção.

Não publique `.env`, credenciais ou diretórios internos. Este projeto não precisa de tokens ou segredos para jogar.

## Para apresentar no portfólio

> Desenvolvi uma aplicação interativa de cassino fictício em JavaScript modular, com interface responsiva, sorteios via Web Crypto, gerenciamento de estado local e testes automatizados. Separei as regras da interface para validar probabilidades e cálculos, implementei proteções contra dados locais inválidos e documentei os limites de segurança de uma aplicação client-side.

Leia `docs/ARQUITETURA.md` para entender o código antes de usar essa descrição. Adapte-a ao que você estudou e às alterações que fizer no projeto.

## Escopo e evolução

Esta primeira versão prioriza um código pequeno e compreensível. Não possui autenticação, banco de dados ou backend financeiro. As rotas de preparação para fornecedores só listam disponibilidade e rejeitam lançamentos enquanto não houver um adaptador oficial. Veja `docs/INTEGRACOES.md`. Fichas locais são alteráveis pelo visitante e não têm valor. Possíveis evoluções de portfólio: migrar a interface para TypeScript, adicionar outro jogo com regras testadas ou ampliar os testes automatizados de navegador.

Licença de distribuição ainda não definida pelo proprietário.
