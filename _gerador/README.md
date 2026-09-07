# Gerador de páginas de produto — Bruto Cerâmica

Sistema criado em 03/09/2026, pra resolver um problema recorrente: toda
vez que um preço ou nome de produto mudava, era preciso editar à mão
umas 15-20 referências espalhadas pelo site (a própria página, as
seções de "produtos relacionados" e "combina com" de outras 16
páginas, o quiz, texturas.html) — processo lento e propenso a erro
(já aconteceu de esquecer algum lugar, ou de um regex bater no campo
errado por engano).

## Como usar

1. Abra `produtos.json`.
2. Ache o produto pelo campo `slug_pagina` e mude o que precisar
   (`preco`, `preco_json`, `nome`, `descricao`, `dimensoes`, `peso`,
   `acabamento`, etc).
3. Rode:
   ```
   python3 _gerador/gerar.py
   ```
4. As 17 páginas `produto-*.html` na raiz do site são reescritas.
5. Confira o `git diff` antes de commitar — se você só mudou um preço,
   o diff deve mostrar **só** esse preço mudando, em todo lugar do
   site que menciona aquele produto, de uma vez.

Requer `jinja2` (`pip install jinja2 --break-system-packages`).

## O que este sistema NÃO faz (ainda)

Só gera as 17 páginas de produto. **Não atualiza**:
- `texturas.html`, `quiz.html`, `sitemap.xml`
- `catalogo.json` (usado pelo precificador)
- As ferramentas internas (`interno/`, `atendimento/`, `fornecedor/`,
  `ordens/`)

Unificar tudo isso numa fonte de dados só é o próximo passo natural
(o Rafael já sinalizou interesse nisso), mas ainda não foi feito.
Por enquanto, mudar um preço/nome ainda exige editar esses outros
lugares separadamente.

## Por que 3 templates, não 1

A estrutura HTML de Brick, Cimentício e Rockface **não é idêntica**
entre si — Cimentício e Rockface têm uma seção extra ("Outras cores
da linha X") que Brick não tem, meta tags com textos diferentes por
linha, etc. Isso só foi descoberto ao construir o sistema (a suposição
inicial era de um template único). Adicionar um produto numa linha
**já existente** não exige mexer no template, só no `produtos.json`.
Criar uma linha nova (uma 4ª categoria) exigiria um 4º template.

## Sobre as imagens

Os arquivos de foto **usam o nome antigo do produto** (decisão
consciente de 02/09/2026 — trocar centenas de referências de imagem
toda vez que um nome comercial muda não valeria a pena). O campo
`slug_imagem` é derivado automaticamente a partir da primeira foto
listada em `galeria` — não precisa (e não deve) ser editado à mão.

## Estrutura dos dados (`produtos.json`)

| Campo | O que é |
|---|---|
| `slug_pagina` | Usado no nome do arquivo (`produto-{slug_pagina}.html`) e nos links |
| `nome` | Nome comercial atual, exibido no site |
| `sku` | Código do fornecedor (Faion) |
| `preco` / `preco_json` | Mesmo valor, em 2 formatos (`153,89` e `153.89`) — os dois precisam ser trocados juntos |
| `descricao` | Texto de marketing da página |
| `dimensoes`, `peso`, `acabamento`, `resistência`, `aplicacao` | Ficha técnica |
| `ambientes_texto` | Texto curto da ficha técnica ("Fachada, Varanda...") |
| `ambientes_chips` | Lista de `{icone, label, principal}` — os ícones "Onde aplicar" |
| `galeria` | Lista de nomes de arquivo de foto, na ordem do carrossel (**com** `.webp`) |
| `combina_com` | Lista de **slugs** (não nome/preço copiado!) dos 3 produtos mostrados em "Combina com estes também" — curadoria manual, não uma regra automática |
| `cross_sell_ordem` | Lista de **slugs**, na ordem exata mostrada em "Outras cores da linha X" (só existe pra Cimentício/Rockface) — também curadoria manual |

**Importante sobre `combina_com` e `cross_sell_ordem`**: guardam só o
slug do produto referenciado, nunca uma cópia do nome/preço dele — o
gerador busca o dado **atual** desse produto na hora de gerar. Isso
foi testado explicitamente (mudar o preço de um produto e confirmar
que a mudança aparece nas páginas que o citam como relacionado) antes
de considerar o sistema pronto.

## Bugs reais encontrados e corrigidos durante a migração (03/09/2026)

Ao construir este sistema, a extração e validação rigorosa revelou
alguns erros de conteúdo que já existiam no site, sem relação com o
gerador em si:

1. O card "combina com" do Kelthar Branco apontava pra imagem/link do
   Naevel Claro, mas o texto (`alt`/`h3`) ainda dizia "Kelthar Branco"
   — corrigido.
2. A meta description do Yavrin Ameno tinha ficado pra trás numa
   atualização de SEO anterior (formato mais curto que os outros 16
   produtos) — corrigido, agora consistente.
3. A página do Ostrek Claro tinha os 3 botões de WhatsApp mandando a
   mensagem de orçamento citando "Zulko Claro" (nome de outro
   produto) — corrigido.
