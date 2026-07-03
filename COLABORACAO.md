# Protocolo de Colaboração — Repositório BRUTO

Este arquivo existe porque **várias sessões de Claude trabalham no mesmo
repositório ao mesmo tempo**, sem se enxergar. Cada sessão só vê o que está
no seu próprio contexto de conversa — não vê o que outra sessão está fazendo
agora. Este documento é o combinado entre todas elas.

Repositório: `https://github.com/devupsite/bruto`
Site: `https://devupsite.github.io/bruto/`

---

## 1. Antes de tocar em qualquer arquivo

```bash
git clone https://github.com/devupsite/bruto.git   # se ainda não clonou
cd bruto
git pull                                             # SEMPRE, mesmo que já tenha clonado antes
```

Nunca assuma que o estado do repositório é o que você viu da última vez.
Outra sessão pode ter commitado nos últimos minutos.

**Leia o arquivo inteiro antes de editar.** Não confie em memória de
conversas anteriores nem em resumos — o arquivo real pode ter mudado.
`view` ou `cat` no arquivo específico que vai mexer, sempre, antes de
qualquer `str_replace`.

---

## 2. Antes de commitar

```bash
git fetch origin
git log HEAD..origin/main --oneline    # tem algo novo que eu ainda não puxei?
```

Se aparecer algo, dê `git pull` de novo antes de commitar. Evita conflito
e evita sobrescrever trabalho de outra sessão sem perceber.

---

## 3. Faça diffs cirúrgicos

- Mude **só o que foi pedido**. Não "aproveite" para reformatar, reorganizar
  ou reescrever trechos vizinhos que não têm relação com a tarefa.
- Depois de editar, rode `git diff --cached --stat` antes do commit e
  confira se o número de linhas alteradas bate com o que você esperava.
  Um diff grande demais é sinal de que algo foi tocado sem necessidade.
- Prefira `str_replace` a reescrever o arquivo inteiro com `create_file`.
  Reescrever o arquivo inteiro é o jeito mais fácil de apagar trabalho de
  outra sessão sem perceber.

---

## 4. Nunca reverta sem confirmar com a pessoa

`git checkout <commit> -- arquivo` desfaz **tudo** que foi feito depois
daquele commit naquele arquivo — inclusive trabalho de outras sessões que
você não viu. Só faça isso se a pessoa pedir explicitamente para reverter,
e mesmo assim avise que isso pode apagar mudanças recentes de outra sessão.

---

## 5. Tokens do GitHub

- Cada token é de uso único nesta conversa. **Depois do push, oriente a
  pessoa a revogar o token** em GitHub → Settings → Developer Settings →
  Personal Access Tokens.
- Nunca reuse um token de uma sessão anterior — ele já deve ter sido
  revogado. Se o push falhar por autenticação, é sinal disso: peça um novo.

---

## 6. Mensagens de commit

Formato curto e descritivo, em português, prefixo de tipo:

```
feat: adiciona X
fix: corrige Y
polish: ajusta Z
revert: desfaz W
```

Mensagens vagas como "update" ou "mudanças" dificultam a próxima sessão
entender o que mudou sem reler o diff inteiro.

---

## 7. Estado do site — pontos que já causaram confusão

Mantenha esta seção atualizada conforme o site evolui. Quando um fato aqui
ficar desatualizado, corrija — não deixe a próxima sessão repetir o erro.

- **Rockface Urban foi removido** do catálogo (descontinuado). Não
  reintroduzir. Rockface ativo: Brisa, Alpino, Grigio.
- **Cimentício ativo:** Alpino, Grigio, Urban (3 modelos).
- **Brick ativo:** 12 modelos.
- **`produto.html`** é um protótipo experimental de página de produto
  dinâmica (`?id=`, dados embutidos em JS, sidebar de categorias). Não está
  linkado em nenhuma navegação do site ainda. Não é a página de produto em
  uso — as 19 páginas `produto-*.html` estáticas são as reais.
- **`produto-template.html`** é o molde-fonte das 19 páginas de produto
  (tem placeholders tipo `[PRODUTO_NOME]`). Mudança estrutural que vale para
  todas as páginas de produto deve começar por ali, não só numa página.
- **`colecoes.html.backup`** existe no repo — versão anterior do catálogo,
  mantida como referência. Não é a página em produção.
- **`paginacoes.html`** tem CSS próprio embutido no `<head>`, separado do
  `styles.css` global — os cards de padrão de assentamento (`.pag-card`)
  não herdam do design system principal.
- Menu de filtro que existia numa versão anterior do `colecoes.html` **não
  está no repositório atual** — se for reconstruído, é do zero.

---

## 8. Design system (resumo rápido)

- Tokens de cor: `--ferro` `--grafite` `--concreto` `--titanio` `--argamassa`
- Tipografia: Barlow Condensed 500/600 (display), Barlow 300/400/500 (body)
- Ícones: Tabler Icons via CDN
- Animação de entrada: classe `.reveal` + `IntersectionObserver` já
  configurado no fim de cada página
- Convenção de imagem de produto: `[categoria]-[nome]-frontal.webp` (capa),
  `-1` a `-3` (detalhe/ambiente)

Para detalhes completos, ver `bruto_identidade_visual_v2_manual_completo.html`
se disponível na conversa, ou o próprio `styles.css`.

---

## 9. Se não tiver certeza

Pergunte à pessoa antes de agir, em vez de assumir. Ela está transitando
entre sessões — é a única que tem visão de tudo o que está acontecendo.

---

## 10. Incidente real — o que acontece quando o item 2 é pulado

Em 03/07/2026, um commit (`1d1e39e`, "CSS do sidebar de filtro") foi feito
em cima de uma cópia local do `styles.css` **desatualizada em 2 commits** —
sem `git fetch`/`git pull` antes. Não houve conflito de merge (o push foi
linear, sem rejeição), então o problema passou batido silenciosamente.

O resultado: 273 linhas do `styles.css` foram sobrescritas por uma versão
antiga, apagando sem querer — junto com a feature nova e legítima do
sidebar — seções inteiras que já estavam em produção:

- FAQ inteiro (`faq__grid`, `faq__item`, accordion) — sem estilo no `index.html`
- Calculadora de m² (`.calc` e sub-classes) — quebrada em 18 páginas de produto
- `.price__unit` (badge de preço/m²) — quebrado em 18 páginas
- Avatar redondo dos depoimentos, hover de zoom em imagens de blog, e mais

Ninguém percebeu na hora porque **o git não acusa erro nesse cenário** —
sobrescrever um arquivo inteiro com uma versão antiga é um push válido,
não um conflito. Só apareceu ao rodar `git fetch` + comparar classes CSS
contra o HTML numa sessão seguinte, várias interações depois.

**A lição prática:** o item 2 ("antes de commitar") não é burocracia — é
a única coisa que teria pego isso na hora. Rodar `git log HEAD..origin/main`
antes de cada commit custa uma chamada de ferramenta e evita horas de
arqueologia depois. Se o diff que você está prestes a commitar em um
arquivo compartilhado (`styles.css`, `COLABORACAO.md`) tiver muito mais
linhas removidas do que você lembra de ter apagado, **pare e investigue
antes de dar push** — pode ser exatamente isso acontecendo de novo.
