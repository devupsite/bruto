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

- **Rockface Urban foi READICIONADO** ao catálogo em 06/07/2026 (ver item 14
  abaixo) — a nota antiga dizia "removido, não reintroduzir", mas isso ficou
  desatualizado. Estado atual: Rockface ativo = Brisa, Alpino, Grigio, Urban
  (4 modelos). Se encontrar essa contradição nesta seção de novo, o item 14
  (datado) é a fonte de verdade, não este resumo.
- **Cimentício ativo:** Alpino, Grigio, Urban (3 modelos).
- **Brick ativo:** 12 modelos.
- **`produto.html`** é um protótipo experimental de página de produto
  dinâmica (`?id=`, dados embutidos em JS, sidebar de categorias). Não está
  linkado em nenhuma navegação do site ainda. Não é a página de produto em
  uso — as 19 páginas `produto-*.html` estáticas são as reais.
- **`produto-template.html`** é o molde-fonte das 19 páginas de produto
  (tem placeholders tipo `[PRODUTO_NOME]`). Mudança estrutural que vale para
  todas as páginas de produto deve começar por ali, não só numa página.
- **`colecoes.html` foi removida** (04/07/2026). Foi substituída por
  `texturas.html`, que assumiu o mesmo papel (catálogo com filtro), sob novo
  nome/design. Todos os ~29 arquivos que linkavam para `colecoes.html`
  (blog, index, paginacoes, as 18 `produto-*.html`) foram migrados para
  `texturas.html`. Links antigos com âncora (`#brick`, `#cimenticio`,
  `#rockface`) continuam funcionando — `texturas.html` lê o hash na carga
  da página e marca o checkbox de Linha correspondente. Se encontrar algum
  link antigo pra `colecoes.html` que passou batido nessa migração, é bug —
  trocar para `texturas.html`.
- **`colecoes.html.backup`** ainda existe no repo — versão anterior do
  catálogo, mantida como referência histórica. Não é a página em produção
  (a página em produção agora é `texturas.html`).
- **`paginacoes.html`** tem CSS próprio embutido no `<head>`, separado do
  `styles.css` global — os cards de padrão de assentamento (`.pag-card`)
  não herdam do design system principal.
- **Menu de filtro em `texturas.html`**: implementado em 04/07/2026 (época
  em que a página ainda se chamava `colecoes.html`; migrada depois). Sidebar
  sticky com checkboxes (Linha / Ambiente / Tom / Faixa de preço), filtro
  cumulativo via JS puro (sem framework), drawer mobile abaixo de 900px.
  Cards têm `data-linha`, `data-ambiente`, `data-tom`, `data-preco` — ao
  adicionar produto novo ao catálogo, lembrar de preencher esses atributos
  ou o filtro vai simplesmente ignorar o card (nunca aparece nos resultados
  filtrados, mas aparece sem filtro nenhum ativo).
- **Sidebar de navegação nas páginas `produto-*.html`** (`product-sidebar-static`)
  é diferente do filtro acima — é só navegação por categoria (accordion
  com lista de produtos da linha), sem checkboxes nem lógica de filtro.
  As duas coisas coexistem por design: navegação simples na página de
  produto individual, filtro robusto na página de catálogo geral.
- **`paginacoes.html`** (04/07/2026): os 25 cards têm `data-style`
  (corrido/classico/geometrico/especial) e `data-ambiente`
  (interno/externo/"interno externo") usados pelos chips de filtro no topo
  da página, mais um selo de dificuldade (`.pag-level--facil|medio|avancado`)
  por card. O padrão **03 Espinha de Peixe** passou por duas versões: a
  original usava `rotate()` por peça individual com espaçamento errado e
  virava um bloco sólido; a correção seguinte trocou pra retângulos sem
  rotação (sem bug, mas ficou com cara de "trançado" 90°, não de espinha de
  peixe de verdade). A versão final gira o **grupo inteiro** em 45°
  (`transform="translate(...) rotate(45) scale(1.05) translate(...)"`) por
  cima de uma malha sem sobreposição — isso preserva o ângulo diagonal
  correto sem reintroduzir o bug de overlap. Se for mexer nesse card de
  novo, manter a rotação do grupo, não voltar a rotacionar peça por peça.
- **`guia-paginacoes-bruto.pdf`** (04/07/2026): PDF gerado com reportlab a
  partir dos mesmos 25 padrões/textos/dificuldade de `paginacoes.html`
  (script fonte não versionado no repo, só o PDF final). Linkado via botão
  "Baixar guia em PDF" no topo de `paginacoes.html`. Se os textos ou a
  dificuldade de algum padrão mudarem no HTML, o PDF fica desatualizado —
  não há geração automática, é preciso regenerar e re-subir manualmente.
- **`paginacoes.js`** (concluído em 04/07/2026): simulador de padrão + cor
  com textura real de foto (técnica de "janela reveladora" via
  background-position para padrões retos; recorte simples via background-size
  cover para peças rotacionadas no espinha de peixe). Seção `.pgn-section`
  já está inserida nas 12 páginas `produto-brick-*.html` **e** no
  `produto-template.html`, com `data-current="[id-do-tijolo]"` setado por
  página. CSS em `styles.css` (bloco "SIMULADOR DE PAGINAÇÃO & COR").
  **Cuidado com a classe `.reveal`:** ela só fica visível se algo adicionar
  `.visible` via IntersectionObserver — esse observer existe na homepage e
  em `paginacoes.html`, mas **não existe nas páginas `produto-*.html`**.
  Colocar `.reveal` num elemento de página de produto o deixa com
  `opacity:0` permanente (bug real, já aconteceu e foi corrigido removendo
  a classe do `.pgn-head`/`.pgn-widget`). Se for adicionar algo novo a uma
  página de produto, não copiar a classe `.reveal` de `paginacoes.html`/
  `index.html` sem also portar o observer, ou simplesmente não usar a classe
  nessas páginas.
  Cimentício ativo: Alpino, Grigio, Urban (3). Rockface ativo: Alpino,
  Brisa, Grigio, Urban (4) — ver correção no topo da seção 7, a nota de
  "descontinuado" estava desatualizada (Urban foi readicionado em 06/07/2026,
  ver item 14). Não confundir com o Cimentício Urban, que é um produto
  diferente e sempre esteve ativo.

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

---

## 11. Cache-busting do styles.css — sempre bumpar a versão

Todas as páginas carregam `styles.css?v=N`. Esse `?v=N` existe só pra
forçar o navegador a buscar a versão nova do arquivo em vez de usar uma
cópia em cache — sem isso, quem já visitou o site (principalmente no
celular, que cacheia mais agressivamente) pode continuar vendo o CSS
antigo por dias, mesmo com o `git push` já feito e o Pages já atualizado.

**Regra:** toda vez que você editar `styles.css` **ou qualquer um dos
scripts compartilhados** (`promo-frete-gratis.js`, `header-scroll.js`,
`back-to-top.js`), incremente o `?v=N` correspondente em **todas** as
páginas que o referenciam (`grep -l "nome-do-arquivo?v=" *.html`). Já
aconteceu de duas rodadas de fix seguidas no CSS saírem sem bumpar a
versão — quem tinha cacheado a v=2 não via nada das mudanças até a v=3
sair. O mesmo vale pros `.js`.

---

## 12. Incidente real — pgn-section desaparecendo em edições isoladas

Em 04/07/2026, `produto-brick-rusticatto-sertao.html` e
`produto-brick-rusticatto-terra-negra.html` perderam inteiramente a seção
`.pgn-section` (simulador de paginação e cor) que já estava publicada nas
12 páginas de Brick. As outras 10 páginas continuaram intactas. A causa mais
provável: alguma sessão reescreveu esses dois arquivos por completo (`create_file`
ou equivalente) para uma tarefa não relacionada, sem perceber que apagava a
seção — reforça o item 3 ("prefira str_replace a reescrever o arquivo inteiro").

**Se for mexer em qualquer `produto-brick-*.html`, confirme antes e depois
que `pgn-section` e `paginacoes.js` continuam presentes** — não assuma que
uma feature já publicada vai continuar lá só porque estava lá da última vez
que alguém checou. Um `grep -c pgn-section` rápido nas 12 páginas de Brick
resolve.

---

## 13. Pendências a validar antes de finalizar o projeto

Registrado a pedido do Rafael (04/07/2026) — conferir tudo isto antes de
considerar o site pronto para ir ao ar de verdade:

1. **Canais de pedido reais.** Os pedidos vão chegar por três caminhos:
   os botões "Solicitar orçamento" / "Falar com consultor" (`cta-buttons`),
   e a ferramenta de PDF (`lead-pdf.js`). Status atual:
   - `WHATSAPP_NUMBER` em `lead-pdf.js` — ✅ resolvido (05/07/2026), já é o
     número real (`5511990049468`), mesmo usado no footer e nos botões
     de produto.
   - `FORMSPREE_ENDPOINT` em `lead-pdf.js` — **intencionalmente em espera**.
     O Rafael pediu pra NÃO configurar ainda: ele vai adquirir um e-mail
     profissional antes, porque o Formspree fica atrelado ao e-mail da
     conta, e configurar agora com um e-mail provisório significaria
     redoing depois. Não mexer nisso até ele passar o endpoint pronto.
   - Footer: e-mail (`contato@bruto.com.br`) ainda é `href="#"`, não
     `mailto:` — mesma lógica, provavelmente também depende do e-mail
     profissional que está sendo adquirido. Confirmar com o Rafael antes
     de trocar, pode ser o mesmo caso do Formspree.

2. **Ferramenta de "ordem de serviço do pedido" — construída em 08/07/2026**
   (a pedido do Ewerson, não confundir com o pedido do Rafael registrado
   antes — os dois quereriam essa ferramenta eventualmente). Arquivos:
   `ordem-servico.html` + `ordem-servico.js`. Decisões tomadas com o
   Ewerson antes de construir:
   - **Entrada manual**: Ewerson/Rafael digitam o pedido recebido pelo
     WhatsApp direto na ferramenta — não há integração automática puxando
     dados do WhatsApp ou do Formspree (o site é estático, sem backend,
     isso não é viável hoje).
   - **Saída dupla num só botão**: gera o PDF da OS (visual parecido com
     o `lead-pdf.js`, mas simples — sem jsPDF+html2canvas de tela, só
     texto/tabela) **e** abre o WhatsApp com mensagem pronta pro
     fornecedor, ao mesmo tempo.
   - **Onde mora**: página no próprio site, `ordem-servico.html`, com
     `<meta name="robots" content="noindex, nofollow">` e sem link em
     nenhum menu — só quem tiver a URL direta acessa. Decisão do Claude
     (Ewerson pediu pra decidir o mais prático), não peça pra linkar no
     menu principal por engano, é ferramenta interna.
   - **Catálogo embutido**: os 19 produtos (nome/SKU/preço/dimensões)
     estão hardcoded dentro de `ordem-servico.js`, extraídos direto das
     páginas de produto no momento da construção. Se preço ou catálogo
     mudar depois, esse arquivo fica desatualizado — não há fonte única
     de verdade compartilhada entre `ordem-servico.js` e as páginas de
     produto. Se for reconciliar isso no futuro, considerar extrair pra
     um `catalogo.json` único que ambos os lados leem.
   - **Numeração da OS**: contador sequencial (`OS-0001`, `OS-0002`...)
     guardado em `localStorage` do navegador de quem usa — não é
     compartilhado entre dispositivos/pessoas. Se Ewerson e Rafael usarem
     de máquinas diferentes, cada um terá sua própria sequência (pode
     gerar números repetidos entre os dois). Ainda não resolvido.
   - **Pendente pra funcionar de ponta a ponta**: `FORNECEDOR_WHATSAPP` no
     topo do `ordem-servico.js` ainda é placeholder
     (`'55SEUNUMEROAQUI'`) — falta o número real de quem recebe o pedido
     na Cerâmica Faion. Mesmo padrão de bloqueio do `FORMSPREE_ENDPOINT`
     e do footer: aguardando decisão/dado do Rafael.
   - Testado com jsdom (lógica de itens, cálculo de subtotal/total,
     validação) — tudo passou. **Não testado num navegador real** nem a
     geração do PDF de fato (o sandbox não tem acesso a
     `cdn.jsdelivr.net`), então vale um teste manual no site antes de
     confiar 100%.

3. **`lead-pdf.js` agora tem um "modo estático"** (04/07/2026, a pedido do
   Ewerson) — além do fluxo dinâmico original (PDF gerado com jsPDF a
   partir da calculadora + simulador), o script aceita um botão gatilho
   com `data-static-pdf="arquivo.pdf"` que pula a calculadora/simulador e
   simplesmente: captura o lead, dispara o download do PDF já existente
   no repo, e abre o WhatsApp com uma mensagem genérica. Usado hoje em
   `paginacoes.html` (botão "Baixar guia em PDF" → `guia-paginacoes-bruto.pdf`).
   Mesmo `FORMSPREE_ENDPOINT`/`WHATSAPP_NUMBER` do topo do arquivo vale
   pros dois modos — configurar uma vez resolve ambos. `?v=` do script
   bumpado de 2 pra 3 em todas as 19 páginas de produto + `paginacoes.html`.

4. **`produto-template.html` está bem mais desatualizado do que o
   esperado** (percebido em 04/07/2026): além de não ter o botão/script do
   `lead-pdf.js` (só isso já era sabido), ele **não tem a calculadora de
   quantidade nenhuma** (`.calc__*`, `#calc-m2`, `#calc-pecas` etc. — nada
   disso existe no template, só nas 19 páginas já geradas). Se alguém gerar
   um produto novo a partir do template hoje, sai sem calculadora e sem
   botão de PDF. Não mexi nisso agora porque é fora do escopo do que foi
   pedido (o pedido era só ligar o gate de lead, e as 19 páginas reais já
   funcionam) — mas fica registrado como dívida técnica real.

---

## 14. Rockface Urban adicionado (06/07/2026)

Rockface passou de 3 para **4 produtos ativos**: Brisa, Alpino, Grigio, Urban.
Dados extraídos direto do site do fornecedor (ceramicafaion.com.br/produto/rockface-urban/):
SKU 93, preço R$ 229,90/m², dimensões reais 290mm x 95mm x 20mm (diferente do
240x65x12mm usado nas outras 3 páginas de Rockface, que parece ter sido copiado
do padrão de Brick por engano — não corrigi as outras 3, só usei o dado real
na página nova; considerar revisar/corrigir isso um dia).

Arquivos tocados: `produto-rockface-urban.html` (novo), 5 imagens
`rockface-urban-frontal*.webp`, sidebar "Rockface" atualizada nas outras 18
páginas de produto, card novo em `texturas.html` (agora 19 produtos).

**Desvio encontrado, não corrigido:** `produto-template.html` não tem a
sidebar de navegação por categorias (`<aside class="sidebar-cat">`) que todas
as 18 páginas de produto reais já têm. O template ficou desatualizado em
relação ao padrão real das páginas — se for gerar um produto novo a partir
dele, vai faltar essa sidebar e vai precisar copiar de uma página real em vez
do template.

---

## 15. Dimensões de Rockface corrigidas (07/07/2026)

As 3 páginas que ainda usavam a dimensão de Brick por engano (240mm x 65mm x
12mm) foram corrigidas com dados reais extraídos direto de
ceramicafaion.com.br:

- **Rockface Brisa** (`produto-rockface-brisa.html`): **260mm x 75mm x 10mm**
  (peso 2,200 kg) — dimensão própria, diferente das outras 3.
- **Rockface Alpino** (`produto-rockface-alpino.html`): **290mm x 95mm x
  20mm** (peso 2,200 kg) — mesma dimensão do Grigio e do Urban.
- **Rockface Grigio** (`produto-rockface-grigio.html`): **290mm x 95mm x
  20mm** (peso 2,200 kg). Nota: no site da Faion o slug real desse produto é
  `/produto/rockface-brisa/` (bug de URL do lado deles, o nome exibido na
  página é "Rockface Grigio" mesmo) — não confundir com o nosso
  `produto-rockface-brisa.html`, que é outro produto.
- **Rockface Urban** já estava correto (290mm x 95mm x 20mm), não foi tocado.

---

## 16. Dimensões de Brick e Cimentício corrigidas (07/07/2026)

Última pendência de dimensões: as 12 páginas de Brick e as 3 de Cimentício
ainda usavam o placeholder `240mm x 65mm x 12mm`. Corrigido com dados reais
extraídos direto de `ceramicafaion.com.br/produto/<slug>/` (cada modelo tem
ficha técnica própria, dimensão não é fixa por linha):

- **Brick** — Branco Rosé, Eco Palha, Lumus, Rosso Prime, Vulcano:
  **270x70x15mm**. Mescla Prime, Terra do Cerrado: **260x70x15mm**. Natura:
  **240x70x15mm**. Os 4 Rusticatto (Fumê, Rosso, Sertão, Terra Negra):
  **270x70x20mm**.
- **Cimentício** — Alpino, Grigio, Urban: **260x75x10mm** (mesma dimensão
  nos três; no site da Faion esses produtos usam slug `brick-alpino`,
  `brick-grigio`, `brick-urban` apesar de estarem categorizados como
  Cimentício — não confundir com a linha Brick do nosso catálogo).

Com isso, **as 19 páginas de produto agora têm dimensões reais** (Brick +
Cimentício + Rockface, todos corrigidos). Único campo alterado em cada
arquivo foi o `<span>` de `.product-specs`; o comentário de exemplo no JS do
simulador (`// ex: "240mm x 65mm x 12mm"`) foi deixado como está, é só
ilustrativo — mesmo padrão da correção do Rockface (item 15).

Pendência que continua de pé: Formspree aguardando e-mail profissional
(item 14/documentado separadamente).

---

## 17. `produto-template.html` removido (07/07/2026)

O arquivo nunca esteve linkado em nenhum lugar do site (nenhuma página
apontava pra ele, não estava no `sitemap.xml`) e estava bem desatualizado em
relação às 19 páginas reais (sem sidebar, sem calculadora, sem botão/script
de PDF — ver item 13/16). Como estava só acumulando dívida técnica sem uso
prático, foi removido do repositório.

**Se for gerar um produto novo no futuro:** duplique uma página real
existente (ex: `produto-brick-lumus.html`) e troque nome, imagens, textos e
dimensões — não existe mais um molde-base dedicado.

---

## 18. Bug real corrigido: `genEspinha()` no simulador interativo (07/07/2026)

Importante não confundir dois "espinha de peixe" diferentes no projeto:

1. **Card estático `03 Espinha de Peixe` em `paginacoes.html`** (item da nota
   acima, "paginacoes.html 04/07/2026") — esse já estava correto, confirmado
   nesta sessão renderizando o SVG isoladamente. Reticulado H/V tesselado no
   espaço não-rotacionado, com o grupo inteiro girado 45° por cima. Não foi
   tocado.

2. **`genEspinha()` em `paginacoes.js`**, usado no simulador "monte sua
   parede" das 12 páginas `produto-brick-*.html` — **esse tinha bug real**.
   Gerava duas peças (+45° e -45°) na mesma posição (x,y), só deslocadas em
   `rowH/2` no eixo Y. Resultado: as peças se cruzavam em "X"/sobrepostas ao
   invés de tesselar em zigue-zague — visualmente incoerente com espinha de
   peixe real (confirmado renderizando a matemática da função fora do
   navegador antes de mexer no código).

   **Correção:** reescrita pra usar a mesma estratégia do card estático que
   já funciona — monta o reticulado H/V (peça horizontal + peça vertical
   encaixada, proporção 2:1 comprimento:espessura) no espaço local
   não-rotacionado, calcula o centro de cada peça, e só então rotaciona
   *esses centros* em 45° ao redor do centro da parede (`rotateAroundCenter`)
   — a peça em si ganha `rot: 45` ou `rot: 135` (135° e -45° são visualmente
   idênticos pra um retângulo, então não precisa de ângulo negativo).
   `cx`/`cy` que existiam no código antigo nunca eram lidos em lugar nenhum
   (código morto) — removidos na reescrita.

   Testado simulando a mesma matemática em Python/SVG fora do navegador
   antes e depois da correção pra confirmar visualmente que parou de
   cruzar/sobrepor peças. `?v=1 -> v2` em `paginacoes.js` nas 12 páginas de
   Brick pra furar cache do GitHub Pages.

   **Atualização (mesmo dia): a correção acima parou o cruzamento em "X",
   mas na verdade só cobria ~44% da área — sobrava bastante fundo visível
   entre os grupos de peças (confirmado calculando a área geometricamente:
   um par H+V no reticulado local cobre 2·L·s de um período L+s ao
   quadrado, o que dá 44,4% pro caso L=2s). O Ewerson desconfiou olhando o
   resultado e pediu pra verificar contra uma referência de espinha de
   peixe de verdade — com razão.**

   Solução definitiva: em vez de "reticulado H/V rotacionado como grupo",
   cada **fileira inteira** (não cada peça) tem uma única orientação (45°
   ou 135°), alternando fileira a fileira, com deslocamento de meio passo
   entre fileiras adjacentes — `step = L / Math.SQRT2` tanto pro
   espaçamento entre peças da mesma fileira quanto pro espaçamento entre
   fileiras. Validado extraindo a geometria pixel a pixel de um padrão CSS
   de espinha de peixe consagrado (renderizado via Playwright/Chromium como
   referência-padrão), depois confirmando cobertura 100% (0% de fundo
   visível numa área de teste) e, por fim, testando a função real dentro de
   `produto-brick-lumus.html` clicando no botão "Espinha de Peixe" do
   widget e conferindo o screenshot com a textura real do produto.
   `paginacoes.js?v=2 -> v3` nas 12 páginas de Brick.

Único campo alterado em cada arquivo: o `<span>` de dimensões dentro de
`.product-specs`. O comentário de exemplo no JS do simulador/calculadora
(`// ex: "240mm x 65mm x 12mm"`) foi deixado como está — é só um exemplo
ilustrativo no código, não um valor lido de fato (o JS já lê o número real
direto do `<span>` via regex).

- `?v=` de `lead-pdf.js` bumpado de 4 pra 5 nas 20 páginas que o carregam
  (19 produtos + `paginacoes.html`), conforme regra do item 11.

---

## 19. Incidente real — `cookie-consent.js` removido sem querer do `index.html` (07/07/2026)

O commit `bc774a8` ("fix: logo/links do index.html apontavam pra #") corrigiu
o que precisava corrigir, mas o diff também **removeu a linha do
`<script defer src="cookie-consent.js?v=1">`** no mesmo arquivo — nenhuma
relação com o que estava sendo consertado. O banner de cookies sumiu só do
`index.html`; as outras 31 páginas continuaram com o script intacto.

Provável causa: a sessão provavelmente reescreveu um bloco maior do que o
necessário (ex: o `<head>`/fim do `<body>` inteiro) em vez de um
`str_replace` cirúrgico nas 3 linhas que realmente precisavam mudar — reforça
o item 3 deste documento.

**Corrigido nesta sessão** — linha restaurada, validado que as 32 páginas do
site voltaram a ter `cookie-consent.js` presente.

**Lição prática:** ao editar qualquer página pra corrigir um problema
pontual (like um link morto), rode um `grep` rápido antes/depois pra
confirmar que scripts/CSS compartilhados que já estavam naquele arquivo
continuam lá — não só o que você foi mexer.

---

## 20. PDFs de guia adicionados a 2 posts do blog (07/07/2026)

Decisão: PDF baixável só faz sentido como material de referência técnica
(coisa que alguém quer consultar offline, na obra) — não pra posts
editoriais/inspiracionais, que perderiam valor de retenção no site se
virassem PDF. Por isso só 2 dos 6 posts ganharam PDF, não todos.

- **`guia-aplicacao-bruto.pdf`** — gerado a partir do conteúdo de
  `blog-post.html` (5 seções + tip-box "Dica BRUTO").
- **`guia-limpeza-bruto.pdf`** — gerado a partir do conteúdo de
  `blog-limpeza-piso.html` (5 seções + tip-box).

Ambos gerados com reportlab (script não versionado no repo, só os PDFs
finais — mesmo padrão do `guia-paginacoes-bruto.pdf`, ver item 13.3).
Capa escura (`--ferro`) com título grande, sumário numerado, corpo em
Helvetica, tip-box com barra lateral — visual consistente com a paleta do
site, mas não é pixel-perfect ao HTML (PDF não herda `styles.css`).

Botão "Baixar guia em PDF" usa o **modo estático** do `lead-pdf.js`
(`data-static-pdf`), igual ao de `paginacoes.html`: captura lead
(nome+WhatsApp+email), dispara o download do PDF já pronto no repo, abre
WhatsApp com mensagem genérica. **Não gera PDF dinamicamente** — ambos os
posts não tinham calculadora/simulador pra alimentar o modo dinâmico, então
o modo estático é o único que faz sentido aqui.

`lead-pdf.js?v=4` **não estava carregado** em nenhum dos dois posts antes
desta mudança — adicionado o `<script>` nos dois. Mesmo `WHATSAPP_NUMBER`/
`FORMSPREE_ENDPOINT` do topo do arquivo vale (Formspree continua em espera,
ver item 13.1 — não mexi nisso).

**Se o conteúdo de `blog-post.html` ou `blog-limpeza-piso.html` mudar no
futuro, os PDFs ficam desatualizados** — mesma dívida técnica já registrada
pro guia de paginações (item 13.3): não há geração automática, é preciso
regenerar e re-subir manualmente. Se crescer o número de posts com PDF,
vale a pena versionar o script gerador no repo em vez de descartá-lo a cada
sessão.

## 14. Plano editorial do blog — registrado para quando Rafa pedir

Rafa pediu uma sugestão de cadência de atualização do blog em 08/07/2026.
Combinado: **não executar nada disso agora** — só registrar aqui pra
retomar quando ele pedir explicitamente ("atualize o blog" ou similar).

**Distribuição atual (na época deste registro):** Técnico (3), Guias (1),
Comparativos (1), Tendências (1), Inspiração (1), Manutenção (1) — 8 cards
na grade + 1 post em destaque (`blog-post.html`, fora da grade).

### Cadência sugerida
1-2 posts por mês, priorizando os pilares mais rasos (tudo que não é
"Técnico", que já está com 3). Ritmo modesto e constante é melhor que
rajada seguida de abandono.

### Rotação por pilar
- **Inspiração** — 1x a cada 2 meses (conteúdo mais compartilhável)
- **Comparativos** — 1x a cada 2-3 meses (só 3 pares possíveis entre as
  3 linhas: Brick×Cimentício, Brick×Rockface, Cimentício×Rockface —
  não estica infinito)
- **Manutenção** — 1x a cada 3 meses (baixo volume, alto valor de busca
  orgânica tardia — gente procura isso meses depois da compra)
- **Técnico** — 1x a cada 2-3 meses (ver pautas abaixo, ainda longe de
  esgotado)

### Pautas técnicas ainda não escritas (mina principal)
- Sustentabilidade na cerâmica — pegada de carbono vs outros
  revestimentos, dados Anfacer de consumo de água/energia
- Glossário de termos técnicos (PEI, ARII, tardoz, junta de movimentação)
  — formato de referência rápida, bom pra SEO de cauda longa
- Comparativo histórico de câmbio/preço — competitividade internacional
  da cerâmica brasileira
- Perfil de arquitetos/projetos que usam material bruto (não precisa ser
  exclusivo BRUTO — pode citar movimento/projetos de terceiros sem virar
  publieditorial)

### Gancho sazonal
- Jan/Fev: atualizar anualmente o post de "Tendências" (já existe o de
  2026 — virar série anual é conteúdo perene de baixo esforço)
- Antes do inverno: manutenção/impermeabilização
- Antes de feriados longos: área gourmet / inspiração de reforma

### Quando Rafa pedir pra retomar
Perguntar se ele quer a lista de 10-12 pautas prontas (título + ângulo)
pra ele escolher ao longo do ano — isso foi oferecido e ele disse "por
enquanto não". Não presumir qual pauta puxar sem perguntar primeiro.

---

## 21. Peso extraído da Faion e adicionado às 19 fichas técnicas + PDF (08/07/2026)

Rafa perguntou se dava pra extrair o peso de cada peça direto do site da
Faion (mesma fonte usada pra corrigir as dimensões). Fui em cada uma das 19
páginas de produto em ceramicafaion.com.br e copiei o valor exato do campo
"Peso" de cada ficha técnica.

**Dado real coletado (Faion usa duas bases de peso diferentes entre as
linhas — reproduzido aqui exatamente como está no site deles, sem
reinterpretar):**

- **Brick, linha padrão** (Branco Rosé, Eco Palha, Lumus, Mescla Prime,
  Natura, Rosso Prime, Terra do Cerrado, Vulcano): **23 kg**
- **Brick, linha Rusticatto/extra rústico** (do Sertão, Fumê, Rosso, Terra
  Negra — todas 2cm de espessura, 1 cm a mais que a linha padrão): **33 kg**
- **Cimentício** (Alpino, Grigio, Urban) e **Rockface** (Brisa, Alpino,
  Grigio, Urban) — todas as 7: **2,2 kg**

Note a diferença de ordem de grandeza entre Brick (23-33 kg) e
Cimentício/Rockface (2,2 kg) mesmo com dimensões de peça parecidas — é
exatamente o que está na ficha da Faion, não é erro de digitação nosso.
Provavelmente bases de medida diferentes (caixa vs. peça individual), mas
como o objetivo aqui foi só reproduzir o dado real sem inventar contexto,
não assumi qual é a base e não normalizei os números.

**O que foi mudado:**
- Novo `.spec-item` com label "Peso" adicionado logo depois de "Dimensões"
  nas 19 páginas de produto (mesmo padrão visual dos specs existentes).
- `lead-pdf.js`: `readPageData()` ganhou `pesoPeca: getSpec('Peso')` — reusa
  o mesmo helper `getSpec()` criado no item 16, sem duplicar lógica. `gerarPDF()`
  ganhou uma linha "Peso da peça" logo abaixo de "Dimensões da peça".
- Como o peso agora vem do `.spec-item` da própria página (mesmo mecanismo
  da dimensão), o PDF nunca fica dessincronizado do que está na ficha
  técnica visível — se o peso mudar no HTML, o PDF já reflete sozinho.
- `?v=` de `lead-pdf.js` bumpado de 5 pra 6 em **todas** as 21 páginas que o
  carregam agora (19 produtos + `paginacoes.html` + os 2 posts de blog com
  PDF estático que outra sessão adicionou depois do meu v5 — trouxe todos
  pro mesmo v=6 de uma vez).

**Nota de merge:** essa sessão divergiu do repositório por um bom tempo —
enquanto eu extraía os pesos da Faion, outra sessão corrigiu as dimensões de
Brick/Cimentício (mesma fonte, resultado idêntico ao que eu ia extrair),
adicionou 3 posts técnicos de blog, corrigiu `cookie-consent.js` removido
sem querer, e mais uma dezena de commits. Rodei `git pull --no-rebase`, só
`COLABORACAO.md` teve conflito real (os dois lados só adicionaram texto no
fim do arquivo) — resolvido mantendo as duas seções, sem perder nenhum
registro de nenhum dos lados.

---

## 22. Peso removido de novo — discrepância de escala não explicada (08/07/2026)

Rafa revisou o dado do item 21 e decidiu **não manter o peso no site por
enquanto**: a diferença de escala entre Brick (23-33 kg) e Cimentício/
Rockface (2,2 kg) é grande demais pra publicar sem entender a causa — risco
de estar comparando bases diferentes (peça vs. caixa vs. m²) sem saber, e
aí o dado fica enganoso pro cliente final em vez de útil.

Revertido nas 19 páginas de produto + `lead-pdf.js`:
- Removido o `.spec-item` de "Peso" das 19 fichas técnicas.
- Removido `pesoPeca` de `readPageData()` e a linha "Peso da peça" de
  `gerarPDF()` — voltou a ser idêntico ao estado do item 16 (só dimensão).
- `?v=` de `lead-pdf.js` bumpado de 6 pra 7 (conteúdo do arquivo mudou de
  novo, precisa furar cache de novo).

**O que ficou:** as dimensões (item 15/17) continuam no site — só o peso
saiu. Se decidir usar peso no futuro, a base extraída está registrada no
item 21 acima (não apagada, só não publicada) — antes de subir de novo,
vale confirmar com a Faion diretamente qual é a base de cada número (peça
individual? caixa? m²?) em vez de assumir.

---

## 23. Tabela de parcelamento adicionada (informativa, sem gateway ativo) (08/07/2026)

Item pendente desde as instruções originais de implementação. Perguntei ao
Rafa se já havia gateway configurado — resposta: **ainda não, seria só
informativa**. Segui a recomendação original: hardcode simples via JS
compartilhado, sem integração de checkout.

**O que foi feito:**
- Novo `parcelamento.js` (compartilhado, não duplicado por página) — lê o
  preço já exibido em `.price` (mesmo elemento que a calculadora de
  quantidade já usa) e calcula:
  - Pix: 10% de desconto sobre o preço/m²
  - 1x a 4x: sem juros (preço cheio)
  - 5x a 12x: Tabela Price, juros de 4,5% a.m. — mesma taxa citada nas
    instruções originais. **Não bate exatamente** com a tabela de exemplo
    da Faion (diferença de R$1-2 nas parcelas mais longas) porque a taxa
    real de um gateway específico nunca é uma Tabela Price pura — isso é
    esperado e está coberto pelo disclaimer "valores informativos... sujeito
    à confirmação no fechamento do pedido".
- CSS novo em `styles.css` (`.price-parc` e subclasses) — Pix em destaque
  com badge, "até 4x sem juros" como texto principal (CTA visual, conforme
  pedido nas instruções originais), tabela completa 5-12x escondida atrás
  de um toggle "Ver todas as parcelas" — não empurra "com juros" pra cima
  do usuário, mas deixa disponível e claramente marcado (compliance CDC).
- `<div id="parcelamento-info"></div>` inserido logo após `<p class="price">`
  nas 19 páginas de produto + `<script defer src="parcelamento.js?v=1">`
  antes do `</body>` de cada uma.
- `styles.css?v=` bumpado de 11 pra 12 nas 34 páginas do site.

**Quando o gateway real for definido:** essa tabela provavelmente vai virar
redundante/incorreta (cada gateway calcula parcela do jeito dele). Trocar
por integração real nesse momento — não é pra manter os dois em paralelo.

---

## 24. Formspree configurado de verdade (08/07/2026)

Pendência do item 13.1 resolvida. Rafa passou o endpoint real:
`https://formspree.io/f/xbdveedy` (ele mandou um endpoint antes,
`xdarvvkw`, e corrigiu em seguida pra este — usei só o segundo, o
`xdarvvkw` nunca foi configurado em lugar nenhum).

**O que mudou:**
- `FORMSPREE_ENDPOINT` em `lead-pdf.js` trocado do placeholder
  `SEU_ID_AQUI` pro endpoint real.
- `?v=` de `lead-pdf.js` bumpado de 7 pra 8 nas 22 páginas que o carregam
  (19 produtos + `paginacoes.html` + 2 posts de blog com PDF estático).

**Não confirmado ainda:** pra onde o Formspree encaminha as submissões
depende do e-mail cadastrado na conta Formspree do Rafa — isso não é algo
que o código controla, é configuração deles na plataforma. Ele foi
orientado a conferir em Settings → Notifications no dashboard do Formspree.

**Ainda pendente, não mexido:** o e-mail do footer (`contato@bruto.com.br`)
continua `href=#`, mesma lógica do item 13.1 — provavelmente também
depende do e-mail profissional. Confirmar com o Rafa antes de trocar.

---

## 25. E-mail profissional configurado no footer (08/07/2026)

Rafa passou o e-mail definitivo: `contato@brutoceramica.com.br`.

**Correção de rota, não só preenchimento:** o item 13.1/24 registrava que o
e-mail do footer ainda era `href="#"` esperando esse dado — mas ao checar
agora, as 34 páginas já estavam com `mailto:contato@bruto.com.br` (domínio
placeholder errado, não o `href="#"` que o registro antigo dizia). Outra
sessão deve ter adiantado o `mailto:` sem essa nota ficar atualizada aqui.
Troquei o domínio nas 34 páginas para o real.

Com isso as duas pendências do item 13.1 (Formspree + e-mail) estão
resolvidas.


## Google Tag Manager + tracking de conversão (08/07/2026)

Preparação para o lançamento com tráfego pago — instalado o scaffold de
rastreamento em todas as 34 páginas:

- **GTM (Google Tag Manager)**: snippet padrão no `<head>` + `<noscript>`
  logo após `<body>`, com container ID placeholder `GTM-XXXXXXX`. **Precisa
  ser trocado pelo ID real** (criar conta em tagmanager.google.com). A
  partir do GTM já configurado, o Meta Pixel, Google Ads e GA4 são
  conectados direto no painel do GTM — não precisa mexer no código de novo.
- **`analytics.js`** (novo arquivo, incluído em todas as páginas): escuta
  cliques em links `wa.me`, no CTA de "Solicitar amostra" (`#amostra`) e no
  botão de PDF da calculadora, e envia eventos pro `dataLayer`
  (`whatsapp_click`, `amostra_click`, `pdf_lead_download`).
- **`lead-pdf.js`**: adicionado `window.brutoTrack('form_submit', ...)`
  logo após o `fetch()` ao Formspree ter sucesso (não no clique, no envio
  real) — evita contar tentativas como conversão. Também rastreia o
  WhatsApp aberto pela calculadora, já com produto/valor no evento.
  Bump de `?v=8` pra `?v=9` nas 22 páginas que carregam esse script.

**Pendência real, não é bug**: o container GTM-XXXXXXX é só estrutura —
sem o ID real, nenhum dado chega no Google/Meta ainda. Rafael precisa criar
o container e trocar o placeholder nas 34 páginas (ou eu faço assim que
ele mandar o ID real).
