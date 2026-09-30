# Registro de verificação

Verificação inicial realizada com Node.js 24.19.0.

| Verificação | Resultado |
| --- | --- |
| `npm test` | 19 testes passaram. |
| `npm run check` | Sintaxe válida nos módulos e servidor. |
| `npm run build` | Arquivos públicos gerados em `dist/`. |
| Regras da roleta | Todas as 37 casas, cores, retornos e ângulos testados. |
| Regras dos slots | Todas as 64 combinações verificadas. |
| Persistência | Sessão nova, gravação/leitura, dados corrompidos, bloqueio e histórico limitado testados. |
| Servidor | Métodos restritos, arquivos internos negados, tipos MIME e cabeçalhos testados. |
| Fornecedores | Modo real, campos extras, URL como jogo, origem cruzada, corpo excessivo e sessões sem configuração rejeitados. |
| Navegador real / responsividade | Não concluída: infraestrutura de pré-visualização indisponível nesta execução. |
| GitHub Actions | Workflow configurado para push e pull request; consulte o resultado de cada commit na aba Actions. |

## Conferência visual recomendada antes de apresentação pública

- Computador e celular: mesa, controles e textos sem cortes ou rolagem horizontal.
- Uma rodada de cada jogo: resultado, saldo, histórico e retorno corretos na tela.
- Recarregar e abrir outra aba: estado restaurado e sincronizado.
- Teclado: foco visível, campos acessíveis e diálogos fecháveis por Escape.
- Preferência de movimento reduzido: rotação longa desativada.
- Reiniciar: confirmação obrigatória, saldo de 1.000 e histórico limpo.

Os testes automatizados cobrem regras e proteções específicas; não equivalem a uma auditoria de segurança completa ou a uma validação visual.
