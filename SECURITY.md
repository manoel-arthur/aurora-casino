# Segurança e limites de confiança

## Escopo

Aurora Casino é um projeto de portfólio com fichas fictícias. Não processa dinheiro, documentos, senhas ou dados de pagamento. Não possui conta de usuário ou serviço de apostas. Nenhuma análise automatizada garante ausência de vulnerabilidades.

## Proteções implementadas

| Risco | Medida |
| --- | --- |
| Aposta inválida ou saldo negativo | Inteiros de 10 a 500, validação de saldo e proteção de overflow antes da transição. |
| Cliques duplicados | Bloqueio imediato da rodada e dos controles. |
| Abas concorrentes | Web Locks quando disponível, leitura da sessão mais recente e sincronização por evento `storage`. |
| Conteúdo malicioso no histórico | Dados locais validados, valores exibidos por `textContent` e nós DOM; sem `innerHTML` ou avaliação de strings. |
| JSON corrompido ou armazenamento negado | Recuperação controlada e aviso; jogo pode continuar em memória. |
| Scripts externos e injeção de código | CSP restritiva no servidor local; sem scripts, fontes, imagens ou rastreadores externos. |
| Clickjacking | `frame-ancestors 'none'` e `X-Frame-Options: DENY` no servidor. |
| Detecção incorreta de MIME | Tipos explícitos e `X-Content-Type-Options: nosniff`. |
| Exposição de arquivos internos | Lista explícita de arquivos públicos; não serve `.git`, `.env`, testes ou documentação. |
| Cadeia de dependências | Zero dependências npm; Actions com hash de commit, permissões de leitura e credenciais de checkout não persistidas. |

Os cabeçalhos do build são exportados em `_headers`. Seu provedor deve aplicá-los. No domínio HTTPS, o build também solicita HSTS por um ano; a política só é efetiva quando o host a envia e o navegador recebe a resposta por HTTPS.

## Limitações intencionais

- **O cliente não é confiável.** O visitante pode editar código, saldo e histórico com as ferramentas do navegador. Não há mecanismo antifraude nem proteção monetária.
- Sorteios com Web Crypto não tornam uma aplicação client-side adequada a apostas reais. Não há auditoria ou certificação de jogos.
- Os dados pertencem ao navegador e à origem. Não há backup, sincronização entre dispositivos ou recuperação de conta.
- Em navegadores sem Web Locks, rodadas simultâneas em abas diferentes podem causar perda de atualizações. O bloqueio dentro da mesma aba continua funcionando.
- No modo privado ou com armazenamento bloqueado, o progresso pode não persistir.
- GitHub Pages não interpreta `_headers`. A política de proteção do host precisa ser verificada após qualquer publicação.
- O servidor Node incluído é de desenvolvimento, escuta `127.0.0.1` por padrão e não substitui uma plataforma de hospedagem de produção.

## Antes de publicar ou mudar o escopo

1. Execute `npm run check`, `npm test` e `npm run build`.
2. Publique somente `dist/`, por HTTPS, e confira os cabeçalhos do host.
3. Não coloque tokens, senhas ou chaves no JavaScript nem no repositório.
4. Revise permissões e versões de qualquer dependência ou Action nova.
5. Se adicionar contas, APIs ou dados pessoais, reavalie a arquitetura, autenticação, autorização e privacidade antes de publicar.

## Relatar um problema

Para falhas comuns desta demo, descreva os passos de reprodução, comportamento observado e navegador em uma issue. Não publique segredos ou dados pessoais. Caso um futuro backend introduza uma falha sensível, combine primeiro um canal privado com o mantenedor.
