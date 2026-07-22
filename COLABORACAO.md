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
- **`paginacoes.html`** (04/07/2026, atualizado 09/07/2026): os 25 cards têm
  `data-style` (corrido/classico/geometrico/especial) e `data-ambiente`
  (interno/externo/"interno externo") usados pelos chips de filtro no topo
  da página, mais um selo de dificuldade (`.pag-level--facil|medio|avancado`)
  por card. O padrão **03 Espinha de Peixe** já passou por *três* versões:
  (1) `rotate()` por peça individual com espaçamento errado, virava bloco
  sólido; (2) retângulos sem rotação com o **grupo inteiro** girado 45°
  (evitava o bug, mas não é a construção real de espinha de peixe); (3) —
  **versão atual, 09/07/2026** — voltou a ser rotação por peça individual,
  mas agora usando a mesma matemática já validada e corrigida do simulador
  real (`genEspinha()` em `paginacoes.js`: cada FILEIRA inteira tem uma
  única rotação — 45° ou 135° — alternando fileira a fileira, com
  `step = L/√2` e meio-passo de deslocamento entre fileiras adjacentes).
  Essa é a mesma fonte de verdade usada no simulador da página de produto —
  **não são mais duas técnicas diferentes**. Cada peça também encolhe
  ~3.2px em torno do próprio centro pra criar vão de massa real (o
  simulador JS usa `border` do CSS pra isso, que não existe em `<rect>` de
  SVG, por isso o ajuste manual). Testado visualmente: cobertura 100%, sem
  buracos, sem peças se cruzando em X. **O aviso de versões anteriores
  para "manter rotação de grupo, não voltar a rotacionar peça por peça"
  está obsoleto — ignorar.** Se for mexer nesse card de novo, a fonte de
  verdade é `genEspinha()` em `paginacoes.js`; regenerar o SVG a partir
  dela em vez de ajustar à mão.
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

---

## 27. Complemento no schema.org — category e dimensão (08/07/2026)

O rollout completo de Schema.org (Product nas 19 páginas + BlogPosting nos
posts + Organization na home) já estava pronto quando cheguei — inclusive
mais completo do que uma tentativa minha em paralelo (que descartei por
estar com preços desatualizados, de antes do reajuste de +10%). Só
complementei duas propriedades que o `Product` de cada página ainda não
tinha: `category` (`Revestimento Brick/Cimentício/Rockface`) e
`additionalProperty` com a dimensão real (`.product-specs`). Reaproveita
dados que já existem na própria página, sem inventar nada. JSON validado
nas 19 páginas + testado no Playwright pra confirmar que não quebrou nada.

---

## 28. Imagens responsivas — srcset/sizes nas 150 imagens do catálogo (08/07/2026)

Todas as imagens eram servidas na mesma resolução pra qualquer tela — um
card pequeno no grid de `texturas.html` baixava o mesmo arquivo de ~300KB
que o lightbox em tela cheia. `loading="lazy"` já estava correto em 100%
das páginas (a única imagem sem o atributo era o placeholder do lightbox,
`src=""` preenchido via JS — não conta).

**O que foi feito:**
- Geradas variantes de 480w e 800w (WebP, qualidade 80) pra toda imagem
  original maior que isso — 284 arquivos novos, ~16MB. Imagens que já eram
  ≤800px de largura (16 delas) não geraram variante (evita upscale).
  Convenção de nome: `arquivo-480w.webp`, `arquivo-800w.webp` — o arquivo
  original mantém o nome exato de sempre (não mexe em nada que já é
  referenciado em `og:image`, JSON-LD, `data-product-image`, arrays de
  galeria etc).
- 266 tags `<img>` em 30 páginas (19 produtos + `index.html` + `blog.html` +
  8 posts) ganharam `srcset` (as variantes disponíveis + o original com a
  largura real) e `sizes="(max-width: 480px) 480px, (max-width: 900px)
  800px, 1200px"`.

**Sobre o `sizes`:** é o mesmo valor pra toda imagem do site, não foi
calibrado caixa a caixa pelo CSS real de cada componente (grid pequeno,
galeria, hero etc) — seria muito mais trabalho pra um ganho marginal. Esse
valor genérico já garante que celular carrega ~480px e tablet/notebook
~800px em vez da imagem original inteira, que é o grosso do ganho.

Testado em Playwright: viewport mobile (390px) carrega a variante `-480w`;
viewport desktop (1400px) carrega o arquivo original. Sem erros de JS em
nenhuma das 30 páginas tocadas.

**Se adicionar produto/imagem nova no futuro:** não tem srcset automático —
se quiser manter o padrão, gerar manualmente `nome-480w.webp` e
`nome-800w.webp` (resize + WebP qualidade 80) e adicionar
`srcset`/`sizes` na tag `<img>`, ou pedir pra próxima sessão rodar de novo
o mesmo processo (é só reaproveitar a lógica: gera variante se largura
original > alvo, e adiciona srcset em toda tag `<img src="X.webp">` que
tiver variante correspondente).

---

## 29. Desconto Pix corrigido (10%→5%) + economia em R$ na calculadora (09/07/2026)

Correção: o desconto Pix estava hardcoded em 10% no `parcelamento.js`
(item 23) — Rafa corrigiu, é **5%**. `DESCONTO_PIX` e o texto do badge
atualizados, versão do script bumpada (`parcelamento.js?v=1` → `?v=2`) nas
19 páginas de produto pra evitar cache antigo com o número errado.

Também implementada a sugestão de mostrar a economia em **R$** (não só %)
dentro do resultado da calculadora de quantidade — decisão: manter o "5%
OFF" como está perto do preço/m² (sempre válido, compacto), mas mostrar o
valor em reais só depois que a pessoa calcula a metragem real dela, porque
aí o número é concreto ("economize R$ 76,95") em vez de abstrato.

**Atenção — número duplicado em dois arquivos:** o `0.05` do desconto Pix
agora existe em dois lugares que **precisam ficar sincronizados
manualmente**:
- `parcelamento.js` → `DESCONTO_PIX`
- Cada `produto-*.html` → dentro de `recalc()`, comentário
  `// Desconto Pix — deve bater com DESCONTO_PIX em parcelamento.js`

Não dava pra compartilhar a constante entre os dois porque a calculadora é
JS inline por página (mesmo padrão dos outros cálculos ali), não um arquivo
compartilhado. **Se o percentual do Pix mudar de novo, tem que editar os
dois lugares** — `parcelamento.js` E as 19 páginas de produto (comentário
deixado no código pra lembrar).

---

## 30. Reajuste de preços +10% (08/07/2026, a pedido do Ewerson)

Todos os 19 produtos tiveram o preço aumentado em pelo menos 10%,
arredondado pra cima até o próximo ",90" (mantém o padrão de preço
"quebrado" já usado no site — ex: R$ 139,90 → R$ 153,90, não R$ 153,89).
Aumento real ficou entre 10,00% e 10,54% dependendo do arredondamento.

**Cada preço aparece em 4 lugares por produto — todos atualizados:**
1. `<p class="price">` — preço principal exibido na página do produto
2. `"price":` no JSON-LD (schema.org, usado por rich snippets do Google)
3. `data-product-price=` no botão do `lead-pdf.js` — alimenta o PDF de
   orçamento que o cliente recebe. **Esse é o mais importante de não
   esquecer** — se ficar desatualizado, cliente recebe PDF com preço
   errado (pra menos, prejuízo direto).
4. `.tex-card__price` em `texturas.html` — card do produto no catálogo

A primeira passada só cobriu o item 1. Os itens 2 e 3 usam formatos
diferentes (JSON-LD usa ponto decimal sem "R$"; `data-product-price` usa
vírgula mas sem o prefixo "R$ ") e ficaram de fora até uma varredura
posterior pegar o resíduo. Se for reajustar preço de novo no futuro,
**checar os 4 formatos**, não só o preço visível na tela.

**`data-preco` em `texturas.html`** (usado pelo filtro de faixa de preço)
foi recalculado caso a caso — 3 produtos que antes eram "até R$150" agora
caem em "R$150–200" com o novo preço (as fronteiras do filtro em si
— 150 e 200 — não mudaram, só a classificação de qual produto cai em
qual faixa). Se o Rafael achar que as fronteiras do filtro fazem menos
sentido agora com o catálogo todo mais caro, isso é uma decisão de design
separada, não resolvida aqui.

**`ordem-servico.js`**: catálogo interno (`CATALOGO`) também atualizado
com os novos preços — sem isso, a ferramenta de OS ficaria gerando pedido
com preço antigo.

**Não tocado**: `bruto-produtos.json` (arquivo de referência solto em
`/mnt/user-data/outputs`, não faz parte do site publicado, não estava
com prioridade de atualizar).

**Nota pra quem mexer no schema.org (item 27) ou no desconto Pix (item 29)
depois desta seção:** confirme que os preços usados nesses cálculos já
refletem os novos valores — outra sessão já teve que descartar um rascunho
de schema.org que tinha sido feito com os preços antigos, antes deste
reajuste ficar visível pra ela.

---

## 31. Deploy real é Hostinger, não GitHub Pages (09/07/2026)

Descoberto nesta sessão, a pedido do Rafael: **o site em produção está
hospedado na Hostinger**, não no GitHub Pages. Até este item, todo o
protocolo deste documento (cache-busting `?v=N`, "confirmar que subiu"
olhando `git log`/GitHub, etc.) foi escrito assumindo GitHub Pages como
destino final — isso estava incompleto.

**Pipeline real:** `git push` → GitHub → Hostinger faz **pull automático**
do repositório e publica a partir daí. Ou seja, existe um elo a mais na
cadeia entre o commit e o site ao vivo.

**Por que isso importa pra próxima sessão:**
- Confirmar `git log --oneline -3` ou olhar o commit no GitHub **não
  garante** que a mudança já está no ar — isso só confirma que chegou no
  GitHub. O Hostinger precisa completar o pull dele antes de refletir.
- Se o pull do Hostinger for por polling (intervalo fixo) em vez de
  webhook, pode haver um atraso real entre push e publicação — vale
  confirmar com o Rafael qual é o mecanismo e, se possível, a frequência.
- Cache-busting (`?v=N`, item 11) continua necessário do mesmo jeito —
  isso é cache de navegador/CDN do lado do visitante, independente de qual
  plataforma serve o arquivo.
- Se algo parecer "commitado mas não mudou no site", antes de assumir bug
  no CSS/JS, checar se o Hostinger já puxou o commit mais recente.

**Pendência:** mecanismo exato do pull automático (webhook vs. polling,
frequência) ainda não documentado aqui — perguntar ao Rafael se for
relevante pra investigar uma defasagem futura.

---

## 32. `catalogo.json` criado como fonte única de preço/dimensão/SKU (09/07/2026)

A pedido do Rafael, depois de discutir a necessidade real: preço e
dimensão de cada produto viviam duplicados em até 5 lugares (página de
produto x4 formatos + `ordem-servico.js`), e isso já causou dado
temporariamente desatualizado pelo menos duas vezes (reajuste de +10%,
item 30; desconto Pix, item 29).

**Decisão de arquitetura — script gerador, não fetch em tempo real:** o
site é estático sem processo de build, então `catalogo.json` **não é lido
pelo navegador**. Ele é a fonte que um script (`scripts/sync-catalogo.py`)
lê pra regenerar os arquivos estáticos sob demanda. Isso evita o risco de
SEO/flash-de-conteúdo-vazio de uma abordagem client-side, e segue o padrão
que o projeto já usa (scripts geradores pra PDFs, srcset, etc — ver itens
13.3, 20, 28).

**Arquivos:**
- `catalogo.json` — 19 produtos, campos `slug`, `nome`, `linha`, `sku`,
  `preco`, `dimensoes_mm`. **Não inclui peso** (removido de propósito, ver
  item 22 — escala não confirmada com a Faion).
- `scripts/sync-catalogo.py` — lê `catalogo.json` e escreve em:
  1. `produto-<slug>.html` — preço visível (`.price`), JSON-LD (`"price"`),
     `data-product-price` (usado pelo `lead-pdf.js`), dimensão (`.product-specs`).
  2. `texturas.html` — `data-preco` (bucket do filtro, **derivado
     automaticamente** do valor numérico: ≤150 `ate150`, ≤200 `150a200`,
     acima `acima200` — antes isso era classificado manualmente a cada
     reajuste, ver nota do item 30) e `.tex-card__price`.
  3. `ordem-servico.js` — reescreve o array `CATALOGO` inteiro a partir do
     `catalogo.json`.
- Uso: `python3 scripts/sync-catalogo.py --check` (dry-run, só mostra o
  que mudaria) e `python3 scripts/sync-catalogo.py` (aplica). **Rodar
  sempre com `--check` primeiro.**

**Bug real encontrado e corrigido nesta migração:** `ordem-servico.js`
tinha a dimensão placeholder antiga (`240mm x 65mm x 12mm`) em **todos**
os 15 produtos Brick e Cimentício — a correção real de dimensão (item 16)
nunca tinha chegado nesse arquivo, só nas páginas de produto. Só Rockface
estava certo lá. Corrigido automaticamente pelo primeiro `sync-catalogo.py`
rodado (diff conferido linha a linha antes do commit, `node --check`
validado).

**O que o script NÃO faz:**
- Não faz bump de `?v=N` em cache-busting (item 11) — isso continua
  manual, avaliar se necessário a cada rodada.
- Não sincroniza os textos de parcelamento (`parcelamento.js` e o
  comentário duplicado do desconto Pix dentro de cada `produto-*.html`,
  ver item 29) — isso é lógica de desconto, não dado de catálogo.
- Não mexe no schema.org além do campo `"price"` já existente.

**Quando o preço ou dimensão de um produto mudar no futuro:** editar só o
`catalogo.json`, rodar `--check`, revisar o diff, depois rodar sem `--check`
e commitar. Elimina a necessidade de caçar os 4-5 lugares manualmente.

---

## 26. Sacola de amostras físicas (08/07/2026)

Benchmark de mercado (Portobello + fabricantes internacionais de brick/stone
veneer) mostrou que amostra física funciona melhor como "produto" escolhido
(até N por pedido) do que como CTA genérico de WhatsApp. Implementado:

- **`amostras.js`** (novo) — sacola de até 3 produtos, persistida em
  `localStorage` (`bruto_amostras_bag`), sobrevive entre páginas.
  Pílula flutuante (`.amostra-pill`, canto inferior direito, acima do
  back-to-top) some quando a sacola está vazia. Modal de revisão + endereço
  segue exatamente o padrão visual do `lead-modal` já usado pelo
  `lead-pdf.js` (mesmas classes CSS, reaproveitadas).
- Envia por **Formspree** (nome, whatsapp, email, CEP, endereço, lista de
  produtos) e abre o **WhatsApp** com mensagem estruturada — mesmo padrão
  duplo-canal do resto do site.
- Botão "Adicionar à sacola de amostras" inserido logo após o bloco
  `cta-buttons` nas 19 páginas de produto, com classes `pd-btn`
  (atenção: essas páginas usam `pd-btn`/`pd-btn--primary`/`pd-btn--secondary`
  no `<style>` local de cada página, não `btn`/`btn--primary` do
  `styles.css` global — são dois sistemas de botão coexistindo).
- **Escopo v1: só nas páginas de produto.** Não adicionei o botão nos cards
  de `texturas.html` porque lá cada card inteiro já é um `<a>` clicável
  (decisão de 07/07) — não dá pra aninhar um botão interativo dentro de um
  link sem quebrar HTML válido. Se quiser adicionar depois, precisa de uma
  abordagem diferente (ex: overlay posicionado por fora do fluxo do link).

**Achado de bug, não relacionado ao que eu fiz — não corrigi:**
`mobile-cta-bar.js` está carregado em todas as páginas (barra fixa de
WhatsApp pro mobile) mas **não existe nenhum CSS pra `.mobile-cta-bar`**
em `styles.css`. O elemento é injetado no DOM mas não tem posicionamento
fixo nem estilo — a feature parece estar quebrada/invisível desde que foi
criada. Vale alguém dar uma olhada.


---

## 33. Rodada de aprimoramentos: bug da mobile-cta-bar + SEO + perf (09/07/2026)

Auditoria completa do site seguida de 7 commits, um por tema:

1. **`mobile-cta-bar` corrigida** — o bug registrado no item 26 (script
   carregado em todas as páginas, mas nenhum CSS existia) foi resolvido:
   bloco `.mobile-cta-bar` adicionado ao fim de `styles.css` (visível só
   <900px, aparece com `.is-visible` após 120px de scroll, respeita
   `safe-area-inset-bottom`). No mobile, `.back-to-top` e `.amostra-pill`
   ganharam offset (`bottom: 72px`/`124px`) pra não ficarem atrás da barra.
   `styles.css?v=15 → v16` nas 37 páginas.
2. **Titles SEO nas 19 páginas de produto** — de "Natura — BRUTO" para
   "Brick Natura — Tijolinho Artesanal para Revestimento | BRUTO" (sufixo
   por linha). `title` + `og:title` + `twitter:title`, 3 tags por página.
3. **FAQPage schema no `index.html`** — JSON-LD gerado a partir das 6
   perguntas já visíveis no FAQ. Se o texto do FAQ mudar, o schema precisa
   ser atualizado junto (estão duplicados por natureza do JSON-LD).
4. **`og-image.jpg` dedicada (1200x630)** no index + `og:url` corrigida de
   `/index.html` pra `/`. As páginas de produto continuam com a foto do
   produto como og:image — isso é correto, não "corrigir".
5. **`.htaccess` novo** — `ErrorDocument 404` (o `404.html` existia mas
   nunca era servido), força HTTPS, headers de segurança (sem CSP de
   propósito — inline scripts + GTM quebrariam), cache (HTML no-cache,
   CSS/JS 7d, imagens 30d) e gzip. Tudo com guard `<IfModule>`.
6. **Tabler Icons fixado em `3.44.0`** (era `@latest` — sem controle de
   versão, atualização do pacote podia quebrar ícones silenciosamente).
   Versão confirmada no registry do npm antes de fixar.
7. **Perf no index** — `width`/`height` nas 13 `<img>` (CLS),
   `fetchpriority="high"` nas 3 do hero (LCP), `loading="lazy"` na imagem
   do Sobre (1200px, carregava eager abaixo da dobra).

**Pendências que continuam abertas da auditoria (não feitas nesta rodada):**
GTM-XXXXXXX placeholder (depende do ID real do Rafael — item nº 1 pra
tráfego pago), consolidação de popups (frete + exit-intent + cookies
empilham na mesma sessão), busca por texto em `texturas.html`, botão de
amostra nos cards do catálogo, tabela de frete por região, seção "como
funciona a compra", minificação de CSS/JS, limpeza de imagens órfãs
(~dezenas de .webp não referenciados), automatizar bump de `?v=` no
sync-catalogo, versionar scripts geradores de PDF, script de verificação
de integridade (links + scripts compartilhados por página).

---

## 34. Correção do item 33.6 — caminho do Tabler Icons na v3 (09/07/2026)

O pin pra `3.44.0` quebrou os ícones do site inteiro: na v3 do pacote o CSS
mudou de `/tabler-icons.min.css` (raiz, padrão da v2) para
`/dist/tabler-icons.min.css` — a URL antiga passou a dar 404 e a fonte de
ícones não carregava (sintoma visível: círculo do cookie, seta do
back-to-top, todos os `ti-*` na verdade). O `@latest` anterior só
"funcionava" por resolução/cache antigo do jsDelivr.

Corrigido adicionando `/dist/` à URL nas 37 páginas. Verificado contra o
tarball real do npm: os 62 ícones `ti-*` usados no site existem todos na
3.44.0 — não há renomeação pendente, era só o caminho.

**Lição:** ao fixar versão de pacote de CDN, conferir a estrutura de
arquivos do tarball daquela versão, não só que a versão existe.

## Página de obrigado / conversão (obrigado.html)

Criada `obrigado.html` — página dedicada de confirmação pós-conversão,
usada como sinal de conversão mais confiável pro Google Ads (page load
independe de JS/bloqueador de anúncio rodar até o fim).

Redirecionamento com delay (não imediato — preserva o estado "concluído"
que já existia nos modais):
- `lead-pdf.js`: calculadora → 4s de delay → `obrigado.html?origem=calculadora`
- `lead-pdf.js`: PDF estático (paginações/guias) → 4s → `?origem=paginacoes`
- `exit-intent.js`: guia PDF → 6s → `?origem=exit-intent`, cancelável se a
  pessoa fechar o modal manualmente (`fechar()` limpa o timer)

Texto da página se adapta por `?origem=` via query string. `noindex` no
`<meta robots>` — página não deve ser indexada nem aparecer em busca.

Versões bumpadas: `lead-pdf.js` v9→v10 (22 páginas), `exit-intent.js`
v1→v2 (35 páginas).

**Pendência**: uma vez o GTM real estiver conectado, criar no painel um
trigger de Page View pra `/obrigado.html` como ação de conversão do
Google Ads — mais robusto que os eventos JS custom (`form_submit` etc.)
porque não depende de bloqueador de anúncio deixar o script rodar.

---

## 30. Terra do Cerrado com fotos reais (2 faces) — mesmo padrão do Lumus (13/07/2026)

Ewerson mandou 2 fotos físicas da peça (papel branco, luz natural, levemente
rotacionada no quadro). Processo aplicado antes de virar `texturas`:

1. Segmentação por cor pra isolar a peça do papel/piso (peça é bem mais
   vermelha que o papel branco e mais clara que o piso cinza/marrom escuro)
2. `cv2.minAreaRect` no maior componente conectado pra achar o ângulo real
   da peça na foto, e rotação da imagem inteira pra endireitar
3. Recorte interno generoso (não just bounding box) pra garantir zero fundo
   visível nas bordas — a primeira tentativa com crop simples (bounding
   box + margem fixa) deixava sliver de papel branco nos cantos porque a
   peça estava rotacionada na foto original
4. Correção de flat-field (divide pela própria versão borrada, technique
   padrão de correção de vinheta/luz direcional) pra aproximar da
   iluminação uniforme das fotos do Lumus — as fotos originais eram
   externas, luz solar direcional, bem diferente da luz de estúdio do
   Lumus
5. Resize final pra 800px de largura (mesmo padrão do Lumus)

Testado no simulador real (Playwright): modo padrão E espinha de peixe
(pra confirmar que o giro/rotação de peça não quebra com a textura real).
Sem erros JS. `w:260, h:70` (dimensão real já usada na ficha técnica da
página, ao invés do genérico 240×65). `paginacoes.js?v=6 -> v7` nas 19
páginas de produto (o motor é compartilhado, cache-bust precisa subir em
todas mesmo só um produto tendo mudado de verdade).

**Restam 10 produtos Brick sem fotos reais de peça** (só Lumus e Terra do
Cerrado têm `texturas` até agora). Mesmo processo se repete quando as
próximas fotos chegarem.

---

## 31. Natura com fotos reais (2 faces) — mesmo processo (13/07/2026)

Mesmo pipeline do item 30 (Terra do Cerrado): segmentação de cor, endireita
via `cv2.minAreaRect`, recorte interno generoso, flat-field, resize 800px.
Única observação: a primeira leva de fotos veio com a segunda imagem
totalmente preta (brilho médio 0 — falha de disparo), Ewerson reenviou e a
segunda versão veio boa.

`w:240, h:70` (dimensão real — largura 240 já estava certa por
coincidência, mas a altura genérica 65 virou 70). `paginacoes.js?v=7 -> v8`
nas 19 páginas. Testado no simulador real via Playwright, sem erros JS.

**Progresso das fotos reais:** Lumus, Terra do Cerrado, Natura (3/12
Brick). Restam 9.

---

## 35. Merge de sessões paralelas + fix de curvatura de borda nas texturas reais (13/07/2026)

Esta sessão (com o Rafael) e a sessão paralela (com o Ewerson, itens 30-31)
convergiram no mesmo dia trabalhando no **mesmo recurso** — fotos reais de
peça no simulador (`texturas` + modo foto-por-peça) — cada uma processando
produtos diferentes sem se ver. Resultado: **4 produtos Brick com fotos
reais** agora (Lumus e Eco Palha desta sessão; Terra do Cerrado e Natura da
sessão paralela). Restam 8 dos 12 Brick.

**Merge:** `git merge` teve 19 conflitos, todos triviais — as duas sessões
bumparam a mesma linha de cache-busting (`paginacoes.js?v=` e, em 7 páginas,
também `lead-pdf.js?v=`) para números diferentes no mesmo commit-base.
Resolvido usando um número **maior que os dois lados** (não escolhendo um):
`paginacoes.js?v=9`, `lead-pdf.js?v=10` em todas as 19 páginas de produto,
garantindo cache-bust do conteúdo já combinado dos dois lados. O conteúdo de
`paginacoes.js` em si mergeou automaticamente sem conflito — as duas sessões
adicionaram entradas diferentes no mesmo array `coleções.brick.itens`.
Validado com jsdom: as 4 texturas reais + os 9 padrões de assentamento
(inclusive os 5 novos: Quarto Corrido, Fiadas Duplas, Vertical, Cesta,
Diagonal) renderizam sem erro depois do merge.

**Lição técnica pra quem for fotografar/processar a próxima peça (registrar
aqui pros itens 30/31 também seguirem isso):** peça cerâmica artesanal real
não é um retângulo perfeito — a borda física é levemente ondulada. Um
recorte de perspectiva feito só pelos 4 cantos (`minAreaRect` +
`getPerspectiveTransform`) deixa essa ondulação (e às vezes um triângulo do
papel de fundo) visível perto da borda da textura extraída. Isso é
invisível numa peça isolada, mas **no modo foto-por-peça, onde a foto vira
um ladrilho de bordas retas encostado no vizinho, a curva denuncia a junta**
— o pedreiro fica "torto". Correção: aumentar a margem de recorte para
dentro (nesta sessão, de ~2,8% para 7% na vertical) até sobrar só o miolo
reto da peça, e **validar simulando 4 fotos coladas lado a lado antes de
aceitar** (não só olhar a textura isolada). As texturas do Lumus e Eco Palha
já foram reprocessadas com esse inset maior; vale conferir se Terra do
Cerrado/Natura (sessão paralela) têm o mesmo sintoma — o processo descrito
nos itens 30/31 (recorte "generoso" + flat-field) parece já mitigar isso,
mas não foi testado especificamente contra ladrilhamento lado a lado.

**Progresso real de fotos reais no Brick:** Lumus, Eco Palha, Terra do
Cerrado, Natura (4/12). Restam 8: Branco Rosé, Mescla Prime, Rosso Prime,
Rusticatto (Fumê, Rosso, Sertão, Terra Negra), Vulcano.

**Correção ao diagnóstico acima (14/07/2026) — a causa raiz era outra.**
O Rafael reportou a mesma curvatura no site publicado mesmo depois do fix
de inset. Investigando de novo com uma métrica objetiva (fração de pixels
com cor de papel por linha, do topo/base do recorte até 20% para dentro),
ficou claro que **"aumentar o inset" tratou o sintoma, não a causa**: a
caixa de detecção (`minAreaRect` via segmentação de cor) estava mal
ajustada — maior que a peça de verdade, capturando uma faixa enorme de
papel/fundo dentro do que devia ser só peça (confirmado: a 20% de inset
ainda havia até 98% de papel numa das faces). Nenhum valor razoável de
inset percentual resolve uma caixa fundamentalmente errada — só reduz
proporcionalmente o quanto do erro aparece.

**Correção real:** trocar a segmentação por distância de cor (ruidosa,
sensível a reflexos/objetos na cena) por `cv2.grabCut` com uma semente
retangular no centro da imagem (mesmo enquadramento em todas as fotos
deste lote: peça ocupa aproximadamente x∈[15%,85%], y∈[35%,70%] do
quadro). Resultado muito mais fiel ao contorno real da peça. Antes de
aceitar qualquer caixa nova, **validar quantitativamente**: medir a fração
de pixels com cor de papel (`V>150` e `S<55` em HSV) nas primeiras/últimas
linhas do recorte final — deve cair a ~0% já nos primeiros 2-4% de inset;
se ainda houver 10%+ de papel a 15-20% de inset, a caixa está errada, não
faltando margem. Teste adicional que expõe o problema de forma direta:
empilhar duas cópias da textura com um gap fino da cor do rejunte e medir
o desvio de cor **na própria linha do gap** — deve ser ~0 (junta
perfeitamente uniforme). As 4 texturas (Lumus, Eco Palha corrigidas nesta
rodada) passaram nesse teste com desvio 0,00.

**Lição prática pra quem for processar Terra do Cerrado/Natura de novo ou
qualquer peça nova:** não confiar em "aumentar % de inset" como fix
genérico sem antes confirmar que a caixa de recorte está mesmo ajustada à
peça. Rodar a métrica de fração-de-papel-por-linha antes de aceitar
qualquer textura nova é barato (poucos segundos) e pega esse tipo de erro
antes de virar reclamação visual no site.

---

## 36. Auditoria de qualidade nas 13 texturas de face + correções (14/07/2026)

Rodada a validação quantitativa do item 35 (fração de papel por linha +
teste da junta empilhada) em TODAS as 13 texturas `*-face*.webp` de todas
as sessões. Resultado: 9 aprovadas de primeira; 4 reprovadas e corrigidas:

- `brick-rusticatto-terra-negra-face2`: faixa de papel branco nos últimos
  ~8% da base (100% da linha era papel) — na parede, virava listra branca
  na base de cada peça. Aparada.
- `brick-rusticatto-terra-negra-face1`: mesma faixa, menor (78% na última
  linha). Aparada.
- `brick-rusticatto-rosso-face1`: 10,8% de papel no topo. Aparada e
  normalizada de 1600px para 800px de largura (padrão das demais).
- `brick-lumus-face2`: resíduo de 1,4% no topo. Aparada.

**Armadilhas descobertas no processo (importante pra próxima sessão):**
1. Peças ESCURAS (Terra Negra) têm pontos claros naturais que o detector
   de papel (V>150, S<55 em HSV) marca como falso positivo no miolo
   (1–3% por linha). Isso é normal — o critério de aprovação vale para as
   BORDAS (primeira/última linha), não para o miolo. Limiar de aprovação
   usado: <3% nas bordas.
2. NÃO usar recorte adaptativo de colunas + resize para consertar textura:
   os falsos positivos espalhados estreitam a "faixa limpa" de colunas e o
   resize estica a textura (quase destruiu a lumus-face2; recuperada via
   git checkout). Aparar SÓ topo/base, de fora pra dentro, sem resize.
3. Textura corrigida = mesma URL com conteúdo novo = navegador serve a
   velha. Ao modificar um webp de face, adicionar `?v=N` na entrada
   correspondente do array `texturas` no paginacoes.js (feito nas 4).

**Estado pós-auditoria:** 13/13 texturas aprovadas (junta empilhada com
desvio 0,00 em todas). Rosso segue com 1 face — o giro de 180° do render
dá 2 variantes, mas vale fotografar uma 2ª peça quando possível.
**Pendência de dados:** Sertão e Terra Negra estão com a medida genérica
antiga (240×65) no `COLECOES` — conferir com régua (as demais referências
medidas variam: 265×65, 270×70, 260×70, 240×70).

---

## 37. Conformidade de cor: mescla das texturas com as capas de galeria (14/07/2026)

O Rafael percebeu que os tons do simulador estavam mais escuros que o
normal (Lumus deveria ser mais rosado). Medição confirmou de forma
gritante: todas as 13 faces estavam de **62 a 90 pontos de L mais escuras**
que a capa de galeria (`*-frontal.webp`) do próprio produto. Causa: a
calibração pela folha branca na sombra produz consistência interna entre
peças, mas num nível de exposição muito abaixo das capas (tratadas/mais
claras) — e o cliente compara simulador × galeria lado a lado na mesma
página, então a referência comercial é a galeria.

**Solução (ideia do Rafael, implementada como transferência de cor):**
mescla de 75% em LAB — mediana e dispersão (MAD, escala contida em
0,7–1,4) de cada face puxadas em direção às da capa do próprio produto.
Pós-mescla: ΔL caiu para −15..−23 (resíduo proposital da mescla) e
Δa/Δb ≈ 0 (o rosado do Lumus voltou). Aplicado nas 13 faces + cache-bust
`?v=3` em todas + bump paginacoes.js v11.

**AVISO IMPORTANTE sobre a métrica de auditoria do item 36:** a detecção
de papel (V>150, S<55) só é válida ANTES de normalização de brilho. Depois
da mescla, peças claras (Lumus ~77-82% "papel" nas bordas) disparam falso
positivo — é a própria cerâmica clara, confirmado por inspeção visual das
tiras de borda (textura com grão, sem faixa lisa). A validação geométrica
(recorte sem fundo) deve ser feita ANTES da correção de cor; operações de
cor não alteram geometria. Para peças novas: 1º recorte + validação de
papel; 2º flat-field; 3º mescla com a galeria; nessa ordem.

---

## 38. GUIA CONSOLIDADO — Texturização real no simulador de paginação (referência definitiva)

Consolidação de tudo que os itens 30-31 e 35-37 aprenderam, na ordem certa.
Qualquer sessão que for texturizar uma peça nova segue SÓ este item.

### A. Protocolo de fotografia (orientar o Rafael/quem fotografar)
1. **Luz do dia indireta** — dia nublado ou sombra aberta. NUNCA sol direto
   (assa sombra direcional na foto, que briga com a luz rasante do widget e
   denuncia o giro de 180° das peças).
2. Peça sobre **folha branca A4** (referência de branco + fundo de recorte).
3. Câmera o mais **perpendicular** possível, ~20 cm de altura funciona
   (8000px de captura dá ~5000px por peça — sobra).
4. **2+ peças por referência**, todas na MESMA sessão/luz/horário (meio-dia
   nublado ideal; fim de tarde muda a temperatura de cor e as faces não
   casam). Com 2 faces + giro de 180° o render gera 4 variantes — mínimo
   aceitável; 3-4 peças é melhor.
5. Anotar as **medidas reais com régua** (L × A × espessura) — cada
   referência tem a sua (já medidas: Lumus/Eco Palha 265×65, Natura 240×70,
   Terra do Cerrado 260×70, Rosso 270×70; PENDENTE régua: Sertão e Terra
   Negra, hoje com 240×65 genérico).
6. Fotografar também as **cabeças** (face curta) quando possível — destrava
   os aparelhos clássicos (Inglês, Flandrês, Monge) que hoje ficam fora do
   simulador.

### B. Pipeline de processamento (ORDEM OBRIGATÓRIA)
A ordem importa: a validação geométrica só funciona antes da correção de
cor (item 37).

1. **Escolher a foto mais nítida** de cada peça (variância do Laplaciano).
2. **Recorte**: `cv2.grabCut` com semente retangular central
   (x∈[15%,85%], y∈[35%,70%] do quadro neste enquadramento) →
   `minAreaRect` → `getPerspectiveTransform`. NÃO usar segmentação por
   cor/limiar (reflexos do piso e objetos claros na cena a enganam — item
   35/36).
3. **Validação geométrica (ANTES de qualquer cor)**: fração de pixels com
   cor de papel (V>150, S<55 em HSV) por linha — deve ser ~0% nas
   primeiras/últimas linhas. Se houver 10%+ de papel a 15-20% pra dentro, a
   CAIXA está errada (refazer o recorte); não adianta aumentar margem.
   Aparar bordas só em LINHAS, de fora pra dentro, SEM recorte de colunas e
   SEM resize (quase destruiu uma face — item 36).
4. **Flat-field** (remove sombreamento direcional): dividir o canal L pelo
   seu blur gaussiano pesado (sigma ~ altura/3), força 0,88 (12% do
   sombreado natural fica, senão vira plástico).
5. **Mescla de cor com a galeria** (item 37): transferência em LAB, mediana
   + MAD (escala 0,7-1,4) em direção ao `<id>-frontal.webp` do produto,
   **força 0,75**. É o que mantém simulador e galeria parecendo o mesmo
   produto na mesma página. Depois desta etapa a métrica de papel do passo
   3 dá falso positivo em peça clara — não reexecutar.
6. **Teste da junta empilhada** (vale em qualquer etapa): empilhar 2 cópias
   com gap fino cor de rejunte e medir desvio de cor NA linha do gap —
   deve ser 0,00.
7. **Export**: webp, 800px de largura, qualidade 84, nomes
   `<id>-face1.webp`, `<id>-face2.webp`… (NUNCA sobrescrever o
   `<id>-frontal.webp` — é a foto de marketing da galeria/cards).

### C. Integração no código
1. Em `paginacoes.js`, no item da coleção: dimensão real (`w`, `h` em mm) e
   `texturas: ['<id>-face1.webp?v=N', ...]`. O modo foto-por-peça +
   sorteio estável de face + giro de 180° é automático quando `texturas`
   existe. Face única funciona (giro dá 2 variantes), mas priorizar 2+.
2. **Cache-busting SEMPRE**: textura modificada = `?v=` incrementado na
   entrada do array; `paginacoes.js` modificado = bump do `?v=` nas ~19
   páginas HTML que o carregam. Conteúdo novo em URL velha = usuário vê o
   antigo (mordeu duas vezes: itens sobre v17→v18 e as texturas).
3. **Smoke test jsdom** antes de commitar: init com o `data-current` do
   produto, conferir contagem de peças, distribuição face1/face2 ~50/50,
   giradas ~50%, `backgroundSize: 100% 100%`.

### D. Fluxo git entre sessões paralelas (reforço do topo deste arquivo)
`git fetch` + conferir `HEAD..FETCH_HEAD` **antes de commitar E antes de
push** (duas sessões já colidiram no dia 13/07 — item 35). Conflito de
linha `?v=` entre sessões: resolver com número MAIOR que os dois lados.
Registrar o que fez neste arquivo ao final.

### E. Estado atual (14/07/2026) e fila
- **Texturas reais**: 7/12 Brick (Lumus, Eco Palha, Natura, Terra do
  Cerrado, Sertão, Terra Negra, Rosso — este com 1 face). 13 faces, todas
  auditadas e mescladas com a galeria. Cimentício e Rockface: 0 (ainda na
  janela reveladora com foto de marketing).
- **Fila**: 5 Bricks restantes (Branco Rosé, Mescla Prime, Rosso Prime,
  Rusticatto Fumê, Vulcano); 2ª peça do Rosso; régua no Sertão/Terra Negra;
  cabeças das peças p/ aparelhos clássicos; texturizar cimentício/rockface;
  GTM placeholder antes de tráfego pago (prioridade do Rafael, fora do
  simulador).

---

## 39. Auditoria de WhatsApp em todo o site (14/07/2026)

Rafael passou um número (11956599809) achando que era pra preencher um
placeholder pendente. Antes de aplicar, chequei: o número do cliente já
está resolvido desde o item 13 (`5511990049468`), e o número do fornecedor
não vive mais no código — outra sessão já moveu pra
`bruto-secrets/API/whatsapp-fornecedor.php` no servidor Hostinger, fora do
Git (mesmo padrão do `.htpasswd`). Perguntei pra qual finalidade era o
número novo; Rafael respondeu **descartar o número e auditar** se o que já
existe está correto em todo lugar.

**Auditoria feita, cobrindo as 33 páginas HTML + 5 arquivos JS que tocam
WhatsApp:**
- `wa.me/5511990049468`: presente e idêntico em todas as páginas que
  deveriam ter (blog, produto, index, texturas, paginações, quiz, termos,
  privacidade). `404.html` não tem link direto de WhatsApp, mas linka pra
  `index.html#amostra` que tem — não corrigido, pareceu aceitável pra uma
  página de erro, mas fica registrado caso alguém prefira um botão direto.
  `ordem-servico.html` corretamente não tem `wa.me` estático (usa a API do
  fornecedor via JS, não é o número do cliente).
- `WHATSAPP_NUMBER` nos 4 JS que declaram a variável (`mobile-cta-bar.js`,
  `promo-frete-gratis.js`, `lead-pdf.js`, `amostras.js`) e o valor
  hardcoded em `exit-intent.js`: todos `5511990049468`, sem divergência.
- Schema.org `"telephone"`: só em `index.html` (correto, é ali que mora o
  LocalBusiness), valor `+55-11-99004-9468` batendo com o resto.
- `tel:+5511990049468`: presente e idêntico nas 31 páginas que têm footer
  completo.
- Zero placeholders residuais (`SEUNUMERO`, `XXXXXXXXXX`, `0000000000`) em
  qualquer HTML/JS.

**Bug real encontrado e corrigido:** em
`produto-brick-rusticatto-sertao.html` e
`produto-brick-rusticatto-terra-negra.html`, o botão secundário "Falar com
consultor" apontava para `index.html#amostra` em vez do `wa.me` direto com
mensagem pré-preenchida — visualmente idêntico aos outros 17 produtos
(mesmo label, mesmo ícone), mas o clique mandava o cliente de volta pro
início do site em vez de abrir o WhatsApp. Provavelmente um esquecimento de
alguma sessão anterior ao copiar a página a partir de um template mais
antigo. Corrigido nas duas páginas, seguindo exatamente o padrão das
outras 17 (mesma estrutura de mensagem: "Olá! Tenho interesse no
{produto}, poderia me ajudar?").

**Melhoria aplicada em `404.html`:** único ponto do site sem link direto de
WhatsApp (só linkava pra `index.html#amostra`). Adicionado um terceiro
botão ("Falar no WhatsApp") ao lado de "Página inicial" e "Ver coleções",
mesmo padrão visual (`btn btn--outline`) e mesmo número, com mensagem
genérica própria pra contexto de página não encontrada.

---

---

## 40. Auditoria do FAQ contra a operação real (14/07/2026)

Rafael pediu pra revisar o FAQ (`index.html`) contra uma auditoria do site,
sinalizando de antemão que a resposta de amostra ("frete por nossa conta")
estava desatualizada. Existem **dois lugares** que precisam ficar sempre
idênticos: a seção visível `.faq` e o `<script type="application/ld+json">`
`FAQPage` (schema.org, lido pelo Google pra rich snippets) — os dois foram
auditados e corrigidos juntos, e validados por script que confirma as 6
perguntas batendo palavra por palavra entre os dois blocos.

**Achados, cruzando contra `parcelamento.js` e `/interno/`
(`atendimento-tecnico.html`, `precificador-comercial.html`):**

1. **Amostra** — confirmado com Rafael: custo de frete varia por
   localização, ainda sem regra definida. Resposta trocada pra genérica
   ("varia conforme a localização, confirmado antes do envio"), sem
   prometer valor ou faixa.
2. **Prazo de entrega** — achado não solicitado, mas relevante: o FAQ
   público prometia SP em 3-5 dias e demais regiões 7-12 dias. O documento
   interno mostra que produção/separação já leva até 10 dias sozinha, mais
   frete por região (Sudeste 3-6, Sul 4-7, Centro-Oeste 5-8, Nordeste 7-11,
   Norte 10-15 dias úteis) — o real podia chegar a ~25 dias pro Norte,
   contradizendo a promessa pública. Reportado a Rafael antes de mexer;
   resposta dele: "de 7 a 15 dias, dependendo da região", com liberdade de
   refinar a copy. Consolidei numa resposta única (a pergunta específica
   de SP não fazia mais sentido separada) explicando que o intervalo já
   soma produção + frete.
3. **Garantia** — FAQ dizia 12 meses; Rafael confirmou que o correto é
   **6 meses** contra defeitos de fábrica. Só esse número mudou.
4. **Parcelamento/Pix — divergência objetiva, corrigida sem precisar
   perguntar** (matemática direta de `parcelamento.js`, não é decisão de
   negócio): o FAQ dizia "12x sem juros" e "Pix 3%", mas o código real só
   dá sem juros até 4x (5x-12x tem juros de 4,5% a.m., Tabela Price) e o
   desconto Pix real é 5%, não 3%. Corrigido pra refletir o que o site de
   fato calcula em `#parcelamento-info` nas páginas de produto.
5. **Boleto bancário** — aparece só no texto do FAQ, sem nenhuma lógica de
   sistema que confirme ou negue (não é calculado em lugar nenhum do
   código, ao contrário de cartão/Pix). Não mexido — não é uma divergência
   que dá pra provar via código, fica como está até alguém confirmar.

---

## 41. 2ª face do Rusticatto Rosso (peça nova) + achado sobre recorte lateral (15/07/2026)

Fila do item 38 pedia uma 2ª peça do Rosso (até então só `face1`). Cliente
forneceu 2 fotos de uma peça nova (não a mesma da face1), mesma sessão de
luz. Seguido o pipeline do item 38 à risca, com uma diferença relevante:

**Achado novo — recorte lateral às vezes é necessário, não só topo/base.**
O item 36 registrava "aparar SÓ topo/base, sem recorte de colunas" como
lição aprendida. Nesta peça, porém, o enquadramento capturou as **cabeças**
(faces curtas) com folga generosa, deixando 25-38% de papel nas colunas
extremas — bem acima do limiar de 3% e nada relacionado a falso positivo
de textura clara (item 36.1): o perfil coluna-a-coluna era suave e
monotônico (37%→0% ao longo de ~130px), não ruído disperso. A proibição do
item 36 era especificamente contra recorte ADAPTATIVO reagindo a ruído +
resize desproporcional (quase destruiu a lumus-face2). Aqui foi aplicado o
mesmo método já usado pra linhas (limiar robusto: exige 200 colunas
consecutivas <3% de papel antes de aceitar a borda), sem resize
desproporcional — só um crop, com o resize final uniforme de sempre (passo
7, 800px de largura). Validado com teste da junta empilhada nas 5 cores de
rejunte (inclusive grafite, pior contraste): sem halo.

**Distinção que vale registrar:** uma faixa clara de ~L167 (escala 0-255)
no topo da peça passou no critério de papel (S=73,8, acima do limiar
S<55) — é variação natural de queima da argila (mancha clara), não papel.
Confirma na prática o alerta do item 36.1: nem toda claridade é papel: o
teste de saturação, não só de brilho, é o que decide.

**Resultado:** `brick-rusticatto-rosso-face2.webp` exportado (800×242px,
webp q84), registrado em `paginacoes.js` (`?v=4` na entrada, bump geral
`?v=12` nas 19 páginas). Rosso agora tem 2 faces × giro de 180° = 4
variantes na parede (era 2). Smoke test jsdom: 153 peças, face1/face2
41/59%, 100% com `backgroundSize: 100% 100%`.

**Pendências que seguem em aberto** (não avançadas nesta sessão): régua
real de Sertão/Terra Negra (ainda 240×65 genérico); 5 Bricks sem foto real
(Branco Rosé, Mescla Prime, Rosso Prime, Rusticatto Fumê, Vulcano);
Cimentício/Rockface sem textura real; cabeças pra aparelhos clássicos.

---

## 42. Auditoria de segurança (15/07/2026) — achado real, ação tomada e pendência futura

Auditoria pedida pelo Rafael, com foco em "não deixar concorrente entender
o backend". Resumo do que foi encontrado — ver a conversa completa pra
detalhe da investigação (repo é público, confirmado via API do GitHub):

**Achado crítico:** o arquivo `interno/.htpasswd` (hash da senha da área
`/interno/`) foi commitado no repo público no commit `1180ea3` e removido
depois no `9b095ba` — mas isso não some do histórico. Confirmado que o
arquivo continua recuperável publicamente via
`raw.githubusercontent.com/devupsite/bruto/1180ea3/interno/.htpasswd`
(testado, retornou 200). Além disso, `interno/precificador-comercial.html`
expõe nome real de fornecedor ("Faion"), fórmulas de margem e números de
lucro de exemplo — e a proteção Basic Auth do `.htaccess` **ainda não
está funcional** (falta o caminho absoluto do servidor, conforme
comentário no próprio arquivo).

**O que NÃO é problema:** os stubs em `/api/*.php` (enviar-email,
salvar-ordem, whatsapp-fornecedor, chat) só fazem `require` de um
arquivo real fora do repo (`bruto-secrets/`) — não vazam segredo nenhum.
O chat com IA em `atendimento-tecnico.html` também não expõe chave de
API no cliente. Esse padrão está correto — manter religiosamente.

**Ação tomada:** o Rafael vai trocar a senha real de `/interno/`
(a que está hoje em `bruto-secrets/` no servidor) — isso neutraliza o
hash vazado, independente dele continuar no histórico do Git pra sempre.

**PENDÊNCIA FUTURA — limpeza do histórico do Git.** Ainda falta remover
o `.htpasswd` de vez do histórico (ex: `git filter-repo` ou BFG Repo-Cleaner)
pra ele parar de ser recuperável via commit antigo. Não foi feito agora
de propósito: é uma reescrita de todo o histórico de commits, exige
force-push, e quebra o clone local de QUALQUER sessão que esteja
trabalhando no repo no momento (teria que re-clonar do zero). Com várias
sessões atuando em paralelo neste projeto, isso precisa ser coordenado —
avisar todo mundo, ou fazer num momento de baixa atividade. Se você é
uma sessão futura lendo isso: **não faça essa limpeza sozinho sem
avisar o Rafael antes**, e confirme que não há push pendente de
ninguém no momento.

**Enquanto isso não é feito:** também vale terminar de configurar o
Basic Auth funcional no `.htaccess` de `/interno/` (o arquivo já tem o
passo a passo do Hostinger escrito nos comentários) — hoje a pasta está
sem proteção ativa nenhuma.

---

## 41. Mescla Prime com fotos reais (2 faces) + correção de dimensão (15/07/2026)

Sessão em paralelo às dos itens 39-40 (mesmo dia), sem se ver — convergiu
de novo no mesmo recurso do item 35. Seguido o protocolo do item 38 do
início ao fim para a peça Mescla Prime, a partir de 2 fotos (1 peça por
foto, 8000×6006px, papel A4 branco, luz do dia indireta — conforme
protocolo A).

**Pipeline (item 38.B) aplicado nesta ordem:**
1. Recorte por `cv2.grabCut` com semente retangular (não segmentação por
   cor) — rodado em resolução reduzida (max 1600px no lado maior, por limite
   de memória do `cv2.grabCut` nas fotos de 8000px) para achar a caixa, e
   `getPerspectiveTransform` aplicado depois na foto em resolução cheia.
   Peça fotografada em pé (retrato); rotacionada 90° pro padrão paisagem do
   simulador.
2. Validação geométrica ANTES de qualquer cor: fração de papel (V>150,
   S<55) nas linhas de borda caiu para 0,3%–2,2% após um aparo adicional de
   2% em cada lado — dentro do limiar <3% do item 36.
3. Flat-field (força 0,88, sigma = altura/3).
4. Mescla de cor 75% em LAB (mediana + MAD, escala 0,7–1,4) puxando pra
   `brick-mescla-prime-frontal.webp` (capa de galeria já publicada). ΔL
   resultante -24 a -27 (mesma faixa de resíduo proposital do item 37).
5. Teste da junta empilhada: desvio 0,00 nas duas faces.
6. Export: `brick-mescla-prime-face1.webp` / `-face2.webp`, 800px de
   largura, qualidade 84.

**Integração (item 38.C):** `paginacoes.js` — item Mescla Prime ganhou
`texturas: ['brick-mescla-prime-face1.webp?v=1', 'brick-mescla-prime-face2.webp?v=1']`,
ativando o modo foto-por-peça. Cache-bust: bumpado junto com o `?v=12` que
o item 39 (Rosso) já tinha aplicado nas 19 páginas de produto — sem
conflito real no merge, as duas sessões mexeram em entradas diferentes do
mesmo array `texturas` do `paginacoes.js` e o merge automático do Git
resolveu sozinho (mesmo padrão do item 35).

**Correção de dimensão:** medida com régua durante esta sessão deu
**250×70×15mm** (25×7×1,5cm) para a peça fotografada — diferente do
260×70×15mm que estava em `catalogo.json` (valor genérico/pendente,
registrado no item 33/36). Atualizado `catalogo.json` e propagado com
`python3 scripts/sync-catalogo.py` (regenerou o spec de dimensão em
`produto-brick-mescla-prime.html` e a entrada correspondente em
`ordem-servico.js`). O `w`/`h` do item no `paginacoes.js` também usa
250×70 agora, batendo com a medida real.

**Smoke test (item 38.C.3):** jsdom com `data-current="brick-mescla-prime"`
— 152 peças renderizadas, face1/face2 ~46/54, giro ~52%, `backgroundSize:
100% 100%` em todas. Script de teste não commitado (ferramenta ad-hoc, sem
dependência nova no repo).

**Estado pós-merge (considerando também o item 39 do Rosso):** Texturas
reais 9/12 Brick (Lumus, Eco Palha, Natura, Terra do Cerrado, Sertão,
Terra Negra, Rosso [2 faces], **Mescla Prime**). **Fila**: 4 Bricks
restantes (Branco Rosé, Rosso Prime, Rusticatto Fumê, Vulcano); régua no
Sertão/Terra Negra; cabeças das peças p/ aparelhos clássicos; texturizar
cimentício/rockface; limpeza do histórico do `.htpasswd` (item 40, aguarda
coordenação com o Rafael e janela sem push pendente de ninguém).

---

## 40. Régua real de Sertão e Terra Negra (15/07/2026)

Última pendência de dados do item 38 resolvida. Cliente mediu com régua:

- **Rusticatto do Sertão**: 25,5 × 7 × 2 cm → `255mm x 70mm x 20mm`
  (era genérico `240x65`).
- **Rusticatto Terra Negra**: 26 × 6,5 × 2 cm → `260mm x 65mm x 20mm`
  (era genérico `240x65`).

**3 lugares por produto que guardam a dimensão, todos atualizados:**
1. `paginacoes.js` — `w`/`h` (mm) da entrada em `COLECOES`, usado pra
   escala/proporção da peça no simulador de paginação.
2. Ficha técnica da página do produto — 2 ocorrências (JSON-LD
   `additionalProperty` + `.product-specs .spec-item` visível). Essa
   última também alimenta a calculadora de peças/m² da página (lê o
   texto via regex, não precisou de código novo).
3. `ordem-servico.js` — campo `dimensoes` da linha do produto no
   formulário de ordem de serviço.

Espessura (2cm/20mm) confirmada igual nos dois — mantida, não é usada
pelo simulador de paginação (só length/height), só aparece nas fichas
técnicas e no ordem de serviço.

Cache-bust: `paginacoes.js?v=13` (19 páginas) e `ordem-servico.js?v=2`
(1 página). Sessão paralela havia adicionado Mescla Prime no mesmo
intervalo — merge automático sem conflito, versões já compatíveis.

**Fila do item 38 restante:** 5 Bricks sem foto real (Branco Rosé, Rosso
Prime, Rusticatto Fumê, Vulcano — Mescla Prime já saiu da lista);
Cimentício/Rockface sem textura real; cabeças pra aparelhos clássicos.

## 43. Coerência entre o FAQ público e o precificador interno (15/07/2026)

Rafael perguntou se o `interno/precificador-comercial.html` ficou coerente
com o FAQ corrigido no item 40. Não estava: a tabela de frete por região do
precificador (painel "Frete & Margem Real") é só o trecho de **transporte**,
sem incluir o prazo de produção/separação que `atendimento-tecnico.html`
documenta à parte. Somando os dois pro pior caso de cada região, com
produção fixa em 10 dias (valor antigo):

- Sudeste 13-16 · Sul 14-17 · Centro-Oeste 15-18 · Nordeste 17-21 · Norte
  20-25 dias úteis — **as 5 regiões estouravam o teto de 15 dias** que o
  FAQ agora promete (não só o Norte, que foi o exemplo usado na pergunta
  original a Rafael).

Rafael decidiu manter o FAQ em "7 a 15 dias" e ajustar a ferramenta
interna. Resolvido com o mínimo de mudança possível:

- **Produção/separação**: `interno/atendimento-tecnico.html`, de "até 10
  dias úteis" pra "até 4 dias úteis" (as 2 ocorrências do arquivo — linha
  do resumo operacional e linha do script de atendimento pra pergunta de
  urgência). Essa mudança sozinha já resolve Sudeste, Sul, Centro-Oeste e
  Nordeste (todos ficam dentro de 7-15 sem tocar frete).
- **Frete do Norte**: `interno/precificador-comercial.html`, de "10–15" pra
  "9–11 dias úteis" — único trecho de frete alterado, os R$ 380 de custo
  não foram tocados, só o texto do prazo.
- **Validação final** (produção 4 + frete por região): Sudeste 7-10 · Sul
  8-11 · Centro-Oeste 9-12 · Nordeste 11-15 · Norte 13-15 — todas as 5
  cabem dentro de 7-15, com Sudeste tocando o piso e Nordeste/Norte
  tocando o teto.

**Ressalva importante, não escondida do Rafael:** isso é uma reconciliação
numérica pra tornar o site e a ferramenta interna consistentes entre si —
não é uma renegociação real de prazo de produção com a Faion nem de prazo
de transporte com transportadora. Os "4 dias" de produção e o "9-11" do
Norte são estimativas ajustadas pra caber no teto prometido, não dados
operacionais revalidados. Se algum dia esses prazos forem confirmados
como incorretos na prática, os dois arquivos (`atendimento-tecnico.html`
e `precificador-comercial.html`) precisam ser revisitados juntos — e o
FAQ público também, se o teto real for diferente de 15.

**Não tocado, fora do escopo desta pergunta:** a linha "Prazo informado no
site: 9 a 12 dias" pra amostra física, em `atendimento-tecnico.html`. Não
cria contradição numérica com o FAQ público (que agora não promete número
de dias pra amostra, só "varia conforme localização"), mas fica registrado
caso alguém quera revisar esse número depois também.

---

## 44. Correção: Mescla Prime perdeu as manchas características no flat-field (15/07/2026)

Rafael reportou, olhando a peça publicada, que o simulador do Mescla Prime
"perdeu aquelas manchas características deste modelo" (o item 41 desta
mesma sessão). Investigando: **causa raiz era o próprio flat-field do item
38.B.4**, não a mescla de cor do 38.B.5.

**Diagnóstico:** o flat-field usa `sigma ~ altura/3` do recorte pra estimar
e remover sombreamento direcional. No Mescla Prime, a mancha característica
do produto (a variação tonal ampla que dá nome à linha — "mescla") tem
escala espacial parecida com a da própria peça, comparável ao sigma usado
pro flat-field. Resultado: o algoritmo tratou a mancha como se fosse
sombra de iluminação e a atenuou junto. Medido em desvio-padrão do canal L:
o recorte cru tinha std 22,35 (face1) / 19,41 (face2); depois do
flat-field original caía pra 14,39 / 15,02 — uma perda real de 20-35% de
contraste local, camuflada porque a mescla de cor (item 38.B.5) parcialmente
recompunha o contraste global (voltava pra ~18,6/19,5), mas sem devolver a
mancha à forma/posição originais.

**Correção:** sigma do flat-field recalculado proporcional à **largura**
da peça (não altura/3), com blur calculado em baixa resolução e reescalado
(mais rápido, evita timeout em imagens de 5000px+) — na prática um raio de
blur bem maior que a mancha, corrigindo só a iluminação página-inteira e
deixando a mancha intacta. Força reduzida de 0,88 pra 0,6. Resultado: std
final de 27,09 (face1) / 24,31 (face2) — acima até do recorte cru, ou seja,
a mancha característica ficou mais nítida que antes, não mais apagada.
Reprocessado com o mesmo pipeline dos passos seguintes (mescla de cor 75%
LAB inalterada, teste de junta empilhada: desvio 0,00 nas duas faces).

**Nota de protocolo pra próximas peças (atualiza o item 38.B.4):** o sigma
`altura/3` funcionou bem nas 7 peças anteriores porque a variação de cor
delas é mais granular (grão/textura), não uma mancha ampla de escala
comparável à peça inteira. Pra peças com mancha grande e proposital
("Mescla", ou qualquer nome que sugira variação tonal como característica
de venda), calibrar o sigma pela **largura da peça** (bem maior que a
mancha esperada) em vez de usar o valor genérico de altura/3 — e, se
possível, comparar o desvio-padrão do canal L antes/depois do flat-field
como checagem rápida: uma queda de mais de ~15-20% no std é sinal de que o
flat-field está comendo textura característica, não só sombra.

**Arquivos atualizados:** `brick-mescla-prime-face1.webp` /
`-face2.webp` sobrescritos (mesmo nome), cache-bust `?v=1 -> v=2` na
entrada do `paginacoes.js`, bump geral `paginacoes.js?v=13 -> v=14` nas 19
páginas de produto. Smoke test jsdom: 152 peças, todas usando `?v=2`,
face1/face2 ~54/46%, `backgroundSize: 100% 100%` em todas.

---

## 45. Rusticatto Fumê com fotos reais — 2 faces de uma vez (15/07/2026)

Cliente forneceu 2 peças físicas diferentes na mesma sessão de foto — já
sai direto com 2 faces (melhor caso do item 38, evita a limitação do
Rosso que só tinha 1 até a sessão anterior). Pipeline consolidado num
script único (`pipeline.py`, não versionado) cobrindo os 7 passos do item
38.B de ponta a ponta pras duas peças.

**Achado**: face1 apresentou uma faixa mais clara nos primeiros/últimos
~20px de topo/base (ΔL ≈ 8-13 em relação ao miolo) mesmo após o recorte
aprovado (fração de papel <1% nas bordas). Checado ANTES do flat-field/
mescla de cor — já existia no recorte bruto, com saturação bem abaixo do
limiar de papel (S≈18-22 vs S<55) e brilho bem abaixo de papel (V≈54-57
vs V>150 de papel). Não é contaminação: é a crosta de queima mais clara
nas bordas da peça escura, natural do Fumê. Registrando pra próxima
sessão não confundir com o item 36.1 (que era sobre pontos claros no
MIOLO de peças claras) — aqui é BORDA de peça escura, mecanismo
diferente, mesma conclusão (checar saturação, não só brilho).

**Resultado**: `brick-rusticatto-fume-face1.webp` e `-face2.webp`
exportados (800px largura, q84). Registrado em `paginacoes.js`
(`texturas: [...face1.webp?v=1, ...face2.webp?v=1]`) — dimensão w/h
mantida genérica (240×65, não estava na lista de régua pendente do
cliente). Cache-bust `paginacoes.js?v=14` nas 19 páginas. Teste da junta
empilhada (grafite, pior contraste) sem halo visível nas 2 faces. Smoke
test jsdom: 180 peças, face1/face2 97/83, 100% `backgroundSize: 100%
100%`.

**Fila do item 38 restante**: 4 Bricks sem foto real (Branco Rosé, Rosso
Prime, Vulcano — Rusticatto Fumê sai da lista); Cimentício/Rockface sem
textura real; cabeças pra aparelhos clássicos.

**Nota pós-merge (item 44):** sessão paralela achou, no mesmo intervalo,
que o flat-field com `sigma ~ altura/3` apaga manchas amplas em peças tipo
"Mescla" (queda de std do canal L >15-20%). Conferido nas 2 faces do Fumê
com o mesmo teste: queda de só 5-6% (22,09→20,68 e 19,59→18,59) — dentro
do esperado pra correção de sombreamento em textura granular, sem indício
do bug. Não precisou reprocessar. Daqui pra frente, seguir o critério
atualizado do item 44 (sigma pela largura + checagem de std) em peças
com variação tonal ampla proposital.

---

## 41. Investigação de layout quebrado no Cimentício Alpino (17/07/2026)

O Rafael reportou (com print) um bloco flutuante com sombra sobreposto ao
widget de paginação na página do Cimentício Alpino — texto "5% OFF NO
PIX / até 4x / Ver todas as parcelas / Certificação..." (conteúdo do
`#parcelamento-info` + `.trust-badge`, normalmente no fluxo normal da
coluna `.product-info`) aparecendo atrás/à esquerda do widget, e a textura
do padrão parecendo pálida/sem foto real.

**Achado real e corrigido:** `styles.css` tinha blocos CSS DUPLICADOS —
`.pgn-preview-wrap` e `.pgn-wall` cada um definido DUAS VEZES (mesmo
padrão de artefato de merge do item 35/37). Consolidados num bloco único
cada. Isso não muda comportamento hoje (as duas versões não tinham
propriedades conflitantes, só espalhadas), mas eliminava um risco real:
qualquer edição futura em uma cópia e não na outra teria causado
exatamente esse tipo de bug fantasma.

**Não confirmado — falta acesso a navegador ao vivo (Claude in Chrome
desconectado nesta sessão):** não consegui reproduzir/confirmar a causa
exata do bloco flutuante por análise estática de código. Investigado e
DESCARTADO como causa: `.price-parc` sem position especial; `.product-
gallery` é sticky mas CSS sticky não pode vazar pra fora do próprio grid
cell (por spec, não é candidato); `.product-lightbox` tem display:none
correto por padrão; sem `<div>` não fechada entre o header do produto e
o widget (contagem bate). **Hipótese mais provável não descartada**: FOUC
(flash of unstyled content) — screenshot capturado antes do `styles.css`
terminar de carregar, o que explicaria tanto o card sem estilo quanto o
padrão "pálido" (peças sem o bisel/box-shadow do CSS externo ainda não
aplicado). Se o Rafael reportar de novo após um hard-refresh + esperar a
página assentar, e o problema persistir, a próxima sessão com Claude in
Chrome disponível deve inspecionar ao vivo (computed styles do elemento
sobreposto) em vez de re-percorrer esta lista de hipóteses descartadas.

**RESOLVIDO (19/07/2026):** o Rafael mandou um novo print após hard
refresh — página carregada por completo, sem o bloco flutuante, padrão
"Junta a Prumo" renderizando normal com a textura cinza clara real do
Cimentício. Confirma a hipótese do FOUC: não era bug de código, era a
captura anterior pegando a página no meio do carregamento do CSS. A
consolidação dos blocos CSS duplicados (achado real deste item) continua
valendo como melhoria de higiene, mas não era a causa do sintoma
reportado. Item encerrado — nenhuma ação de código pendente aqui.

**Nota — trabalho perdido, refeito (18/07/2026):** o commit local `cd4d797`
(refino de cor do Sertão/Fumê/Rosso-face2 do item 40) nunca chegou a ser
enviado — o ambiente reiniciou antes do push. Reaplicado do zero nesta
sessão com a mesma metodologia (flat-field de plano no Sertão, aparo por
razão borda/miolo no Fumê, aparo forte na Rosso-face2), com os MESMOS
resultados numéricos de antes (Sertão R² 0,75→0,13-0,14, ΔL -22→-5/-6) —
confirma que o método é reprodutível. Cache-bust + bump aplicados. Deixa
de ser pendência.

---

## 42. Descontinuação de Branco Rosé e Vulcano (17/07/2026)

A pedido do Rafael: **Branco Rosé e Vulcano foram descontinuados** e
removidos de toda a base — não são mais parte do catálogo. Isso invalida
as menções a eles em "fila de texturização" nos itens anteriores deste
documento (30 a 41) — não fotografar/texturizar esses dois, o Brick tem
**10 produtos ativos agora**, não 12.

**O que foi removido/ajustado (varredura completa no repo):**
- `produto-brick-branco-rose.html` e `produto-brick-vulcano.html` (páginas)
- Todos os assets `brick-branco-rose-*.webp` e `brick-vulcano-*.webp`
- `paginacoes.js` — 2 entradas de `COLECOES.brick.itens`
- Lista lateral de cores (sidebar) nas 17 páginas de produto restantes
- Cards de cross-sell ("Combina com estes também") que citavam os 2 —
  substituídos por outro produto Brick real, variado por página (nunca
  auto-referência, nunca duplicado dentro do mesmo grid de 3)
- `index.html` — card de destaque do Branco Rosé na home
- `sitemap.xml` — 2 URLs
- `texturas.html` — 2 cards do catálogo de texturas
- `quiz.html` — 2 entradas do array de recomendação
- `catalogo.json` — 2 entradas (`produtos` foi de 19 para 17)
- `ordem-servico.js` — 2 entradas do dropdown de produtos
- `interno/atendimento-tecnico.html` — 2 linhas de referência de preço
- `interno/precificador-comercial.html` — 4 `<option>` (o produto aparece
  2x no arquivo, provavelmente 2 formulários/calculadoras). **Achado
  fino**: o mapa `PRODS` indexa por PREÇO, não por slug — `'139.9'`
  apontava pro nome "Brick Branco Rosé", mas o Eco Palha usa o MESMO
  preço (R$139,90). Corrigido pra `'Brick Eco Palha'` em vez de só
  apagar a chave, senão o rótulo ficaria errado pra quem seleciona Eco
  Palha na calculadora.
- **Fallback global de og:image/twitter:image** — 12 páginas (blog,
  termos, privacidade, texturas, quiz, paginacoes) usavam
  `brick-branco-rose-frontal.webp` como imagem padrão de compartilhamento
  social (não relacionado ao produto em si, só era a imagem "genérica" de
  fallback). Trocado por `brick-lumus-frontal.webp` em todas.

**Não removido de propósito:** as menções históricas a esses produtos nos
itens 30-41 deste documento — é log cronológico, não reescrevo o passado.

**Estado atual:** Brick com 10 produtos (7 com foto real — ver item 40/41
pra pendências de qualidade; Sertão e Fumê ainda com o refino de cor
perdido no reinício de ambiente, ver item 41).

---

## 43. Causa raiz real do bug do item 41: falta overflow:hidden no modo perspectiva (19/07/2026)

O item 41 foi encerrado como "FOUC" com base num print que mostrava a
página limpa — mas era o modo **Frontal** naquele print. O Rafael mandou
um segundo print, desta vez com **"Em perspectiva" ativo**, e o bug
apareceu de novo, clara e consistentemente: o card do widget (`.pgn-wall`
com `rotateY(24deg) rotateX(1.5deg) scale(1.03)` + `box-shadow: 22px 30px
46px`) pintava por cima do conteúdo ANTERIOR da página (preço,
parcelamento, título) — não porque o layout/fluxo do documento estivesse
quebrado, mas porque **transforms 3D e sombras não afetam o fluxo,
apenas a pintura** — sem `overflow: hidden` no elemento pai
(`.pgn-preview-wrap`), a peça inclinada + sombra vazam visualmente pra
fora dos próprios limites do card e cobrem o que estiver por perto.

Isso existia desde a alteração 1 (implementação original do modo
perspectiva) — nunca foi pego porque em telas/scrolls onde o widget não
fica colado perto de outro conteúdo, o vazamento não é visível.

**Correção:** `overflow: hidden` em `.pgn-preview-wrap`. Contém a peça 3D
e a sombra dentro do próprio card — o efeito de profundidade continua
visível, só que emoldurado (sombra corta na borda em vez de vazar pra
fora). Bump `styles.css` v18→v19 em 36 páginas.

**Lição de processo:** ao investigar um bug visual "aleatório", checar
TODOS os estados/modos interativos do componente (aqui: Frontal vs Em
perspectiva) antes de declarar resolvido — um print no estado errado
pode confirmar falsamente uma hipótese (FOUC) que não é a causa real.

---

## 44. Confirmação por diff direto: por que só Cimentício/Rockface (19/07/2026)

O Rafael pediu, com razão, pra eu simplesmente comparar a página Brick
(funcionando) com a Cimentício (quebrada) em vez de só teorizar. Diff
direto confirmou uma diferença estrutural real: as 6 páginas Cimentício/
Rockface têm um bloco `.cross-sell` extra ("Outras cores da linha X",
grid de imagens) posicionado IMEDIATAMENTE ANTES da `<section
class="pgn-section">` — bloco que **nenhuma das páginas Brick tem** (o
cross-sell do Brick, `.combina-com`/`grid-3`, fica DEPOIS do widget, perto
do rodapé). Confirmado nas 6 páginas Cimentício/Rockface, ausente nas
Brick — 100% de correlação com onde o bug aparecia.

Isso não é uma causa alternativa ao overflow:hidden do item 43 — é o
motivo do sintoma só ser VISÍVEL ali: o bug geométrico (peça 3D +
sombra vazando por falta de `overflow:hidden`) sempre existiu em
qualquer página, nas duas linhas. No Brick, o widget tem bastante
respiro até o conteúdo anterior, então o vazamento provavelmente saía da
área visível/não encostava em nada. No Cimentício/Rockface, esse bloco
extra empurra o widget pra mais perto do preço/parcelamento, e o
vazamento passou a colidir visivelmente com esse conteúdo — exatamente o
"card fantasma" reportado.

O fix do item 43 (`overflow: hidden` em `.pgn-preview-wrap`) resolve na
raiz independente da distância — já estava publicado antes deste diff.

---

## 45. CAUSA RAIZ REAL do "card fantasma": div mal-posicionada, não CSS (19/07/2026)

Os itens 41, 43 e 44 estavam TODOS errados sobre a causa — perseguiram CSS
(FOUC, depois overflow do modo perspectiva) quando o problema real era
estrutural no HTML. O Rafael pediu, corretamente, pra eu comparar a
página Brick (que funciona) com a Cimentício (quebrada) em vez de seguir
teorizando — e um diff completo de estrutura (tags+classes, sem texto)
achou a causa em minutos.

**Causa raiz:** o bloco `.cross-sell` extra que outra sessão adicionou
nas páginas Cimentício/Rockface (item 44 já tinha notado que ele existe
só nessas 6 páginas) tem sua própria sequência de fechamento — mas a
`</div>` que fecha `.product-page-content` (o container flex que abriga a
sidebar de categorias + o conteúdo da página) ficou **posicionada logo
depois do cross-sell, ANTES do `<section class="pgn-section">`**, em vez
de logo DEPOIS dele — que é onde ela precisa estar (confirmado comparando
com o Brick, que fecha exatamente ali, direto antes do `</main>`).

Com `.product-page-content` fechando cedo demais, o widget de simulação
(e qualquer coisa depois dele) deixava de ser filho da coluna de
conteúdo e virava mais um item solto dentro do `.product-page-layout`
(que é `display:flex`, sidebar 220px + conteúdo) — cada seção seguinte
brigando por um pedaço da mesma linha flex em vez de ocupar largura
total, empilhada errado. Isso é o "card fantasma": não é sombra vazando,
é literalmente o parser HTML entendendo a árvore de elementos errada por
causa de uma tag no lugar errado.

**Correção:** removida a `</div>` da posição errada (logo após o
cross-sell) e reinserida na posição certa (logo após `</section>` do
pgn-section, antes de `</main>`) — nas 7 páginas afetadas (3 Cimentício +
4 Rockface). Validado com: contagem de profundidade de `<div>` da mesma
forma nas 8 páginas (7 corrigidas + Brick de referência, todas batendo
em 0 agora), balanço global de divs por arquivo (todas OK), e parser
HTML padrão do Python sem erros nas 7.

**Lição de processo, registrada com humildade:** três itens seguidos
(41, 43, 44-diagnóstico) erraram porque fui direto pra teoria de CSS sem
antes fazer a coisa mais simples e óbvia — comparar estruturalmente a
página que funciona com a que não funciona. Quando o Rafael disse "não
tem nada a ver com sombra, é alinhamento de grid" e depois "compare com
o brick", isso deveria ter sido o PRIMEIRO passo de qualquer investigação
de bug visual entre páginas do mesmo template, não o último recurso
depois de esgotar teorias sobre um componente específico.

---

## 46. ABERTURA DE FRENTE — Google Tags, otimização de páginas e SEO (20/07/2026)

A Jessica definiu esta como a frente de trabalho principal entre sessões
**a partir de agora até o lançamento do site**, substituindo o foco em
texturização/paginação (itens 30-45, considerados maduros pra este
momento — pendências residuais seguem registradas, mas não são mais
prioridade). Três eixos:

1. **Levantamento de todos os botões que devem receber tag do Google**
   (Google Tag Manager / gtag — conversão, cliques de CTA). O
   `GTM-XXXXXXX` no `index.html` é placeholder, ainda não é o container
   real. Precisa: inventariar todo botão/link de conversão (WhatsApp,
   "Solicitar amostra", "Falar com consultor", quiz, formulários,
   precificador) em todas as páginas do site, decidir naming de eventos,
   e implementar o disparo (data layer / gtag event) de forma consistente
   — hoje não há nenhum disparo de evento customizado, só o snippet base.

2. **Otimização das páginas** — performance (peso de imagens/CSS/JS,
   lazy-loading, fetchpriority, cache), não só a texturização já feita.

3. **Padrão de práticas de boa indexação no Google** — auditoria de SEO
   técnico: meta tags, canonical, sitemap.xml, robots.txt, dados
   estruturados (schema.org já usado em parte — ver item 27/32),
   hierarquia de headings, alt de imagem, Core Web Vitals, mobile-first.

**Próximo passo:** inventariar o estado atual dos 3 eixos antes de
qualquer mudança (o que já existe vs. o que falta), documentar aqui como
subitens antes de implementar.

### 46.1 Levantamento inicial (20/07/2026)

**Eixo 1 — Google Tags:**
- `GTM-XXXXXXX` é placeholder, presente em 35 das 36 páginas HTML
  (falta em `ordem-servico.html`, ferramenta interna — decidir se deve
  ou não ter GTM, é ferramenta de uso interno da equipe, não de cliente).
- **Zero eventos customizados hoje** — nenhum `onclick`, `data-gtm`,
  `data-event` ou `gtag()` disparado por interação; o snippet só manda
  pageview via `gtm.js` padrão.
- CTAs candidatos a evento de conversão: **73 links `wa.me`** (WhatsApp,
  vários textos/contextos diferentes), **37 "Solicitar amostra"**, **19
  "Falar com consultor"**, **2 "Fazer o quiz"**. Precisa container GTM
  real criado (tagmanager.google.com) antes de qualquer disparo.

**Eixo 2 — Otimização de página:**
- Repo com ~36MB de imagens `.webp` (já otimizado nesse formato).
- `loading="lazy"` em 237 de 266 `<img>` (89%) — 29 sem lazy, checar se
  são justamente as acima da dobra (correto não ter lazy) ou esquecidas.
- `fetchpriority="high"` em só 1 página — checar LCP das demais.

**Eixo 3 — SEO técnico:**
- `robots.txt` e `sitemap.xml` existem.
- `canonical` em 32/36 — faltando em `404.html`, `obrigado.html`,
  `ordem-servico.html`, `quiz.html` (os 3 primeiros fazem sentido não
  indexar; `quiz.html` provavelmente deveria ter).
- `meta description` em 35/36 — falta só em `ordem-servico.html`
  (ferramenta interna, ok não ter).
- JSON-LD (schema.org) em 27/36.
- 0 imagens sem `alt` (bom, já coberto — ver item 28).

**Observação geral:** `ordem-servico.html` e `interno/*.html` são
ferramentas internas da operação, não páginas de cliente — vale decidir
explicitamente se entram nos 3 eixos ou ficam de fora (provável: fora,
exceto por não vazar pro Google — checar se estão no `robots.txt`
como `disallow`).

**Achado de risco:** `robots.txt` só bloqueia `/interno/` — mas
`ordem-servico.html` está na RAIZ do site, fora dessa pasta, e portanto
**não está protegida contra indexação/crawling do Google** hoje. Não
está no sitemap (não seria descoberta por ali), mas se houver qualquer
link apontando pra ela (interno ou externo), o Google pode indexar uma
ferramenta operacional interna. Ação recomendada: mover pra `/interno/`
ou adicionar `Disallow: /ordem-servico.html` explícito no `robots.txt`.
Pendente de decisão antes do lançamento.

---

---

## 46. Primeira rodada de fotos reais em Cimentício/Rockface (19-20/07/2026)

Trabalho noturno solicitado pelo Rafael — mesmo pipeline do item 38,
primeira vez aplicado fora da coleção Brick. Peças recebidas com
etiqueta trocada pelo próprio Rafael (corrigido antes de processar):
o arquivo "cimentício-brisa.jpg" é na verdade **Cimentício Grigio**, e
"rockface-urban" é na verdade **Rockface Grigio**. Ficou faltando
**Rockface Urban** (nenhuma foto recebida ainda).

**Diferença importante deste lote em relação ao Brick, registrada pra
quem for processar o próximo:** as peças de Cimentício/Rockface são
CINZA/CLARAS e **menos saturadas que o próprio papel** — o oposto do
Brick (onde a terracota colorida sempre contrastava mais que o papel
neutro). Isso quebra a suposição-base do item 38: o teste de "papel nas
bordas" (V>150 & S<55 em HSV) não discrimina peça clara de papel aqui —
disparava ~100% mesmo bem no miolo da peça em 2 dos 6 casos. Uma segunda
métrica (variância local do Laplaciano — papel é liso, peça tem grão)
ajudou mas também não é infalível para peças muito lisas/foscas.

**Resultado: 4 de 6 processadas com sucesso e publicadas com foto real**
(validadas por textura, convergência estável em busca adaptativa de
recorte, ΔL/mescla de cor com a galeria):
- Cimentício Grigio, Cimentício Urban
- Rockface Brisa, Rockface Grigio

**2 ficaram DE FORA da textura real por falta de confiança no recorte —
Cimentício Alpino e Rockface Alpino permanecem na janela reveladora
(como estavam antes, sem regressão)**: em ambos os casos a foto da peça
"Alpino" (a cor mais clara de cada linha) tem contraste baixo demais com
o papel pra qualquer um dos dois testes (cor ou textura) convergir com
segurança — testado com busca adaptativa até recuo de 47% de cada lado,
sem nunca zerar a contaminação. Antes de tentar de novo: fotografar essas
duas com um fundo de MAIOR contraste (papel cinza-médio ou preto, em vez
de branco — inverte o problema a favor da peça clara) resolveria isso na
raiz, mais eficiente que insistir em processamento.

**Cada produto veio com 1 peça só** (não 2+ como o padrão do Brick) — o
giro de 180° do render ainda dá 2 variantes, mas é o mínimo aceitável.

**Medidas**: sem régua nesta rodada — mantidas as dimensões genéricas já
cadastradas (Cimentício 260×75mm, Rockface 290×95mm exceto Brisa
260×75mm). A proporção medida nas fotos do Cimentício (~1,4:1, em duas
peças independentes, convergindo entre si) destoa bastante do 260×75
(3,47:1) cadastrado — pode ser imprecisão do meu recorte automático (não
capturou o comprimento total da peça) OU o 260×75 genérico nunca foi
medido de verdade. Vale conferir com a régua na próxima leva.

**Pendências para o Rafael revisar amanhã:**
1. Conferir visualmente Cimentício Grigio/Urban e Rockface Brisa/Grigio
   no site — essas 4 não puderam ser confirmadas visualmente nesta sessão
   (limitação pontual de visualização de imagem do ambiente).
2. Decidir sobre Cimentício Alpino e Rockface Alpino — fotografar de novo
   com fundo mais escuro, ou aceitar que fiquem na janela reveladora por
   ora.
3. Rockface Urban ainda sem foto nenhuma.
4. Medir com régua as peças de Cimentício/Rockface quando possível.

Cache-bust não se aplicou nas texturas em si (arquivos novos, sem versão
anterior pra invalidar) — só bump do paginacoes.js.

---

## 47. Nota técnica: formato de push que funciona de forma confiável (20/07/2026)

O padrão usado até aqui (`git push https://TOKEN@github.com/...`) falhou
silenciosamente numa sessão (19/07 à noite) com erros confusos
("terminal prompts disabled", "No such device or address") mesmo com
token válido — aparentemente um problema de resolução de credencial do
git nesse ambiente específico, não do GitHub. `git fetch` com a mesma
URL funcionava (repo é público, leitura não exige auth de verdade),
mascarando o problema até a hora do push.

**Formato que resolve de forma confiável:**
```
GIT_ASKPASS=/bin/true git push "https://x-access-token:TOKEN@github.com/devupsite/bruto.git" main
```
Usar usuário explícito `x-access-token` (em vez de só o token) e
`GIT_ASKPASS=/bin/true` pra garantir que git nunca tente prompt
interativo se a credencial embutida na URL falhar por algum motivo —
nesse caso ele erra rápido e claro (ex.: "Invalid username or token")
em vez de travar com mensagem enganosa.

---

## 48. Correção de cor: Rosso Prime estava sem mescla com a galeria (20/07/2026)

O Rafael reportou o Rosso Prime "mais escuro que o real" no simulador.
Medição confirmou: ΔL de -64 contra a galeria (padrão esperado é -15 a
-25, ver item 37) — essa textura (adicionada por outra sessão, não
rastreada nos itens anteriores) nunca passou pela etapa de mescla de cor.
Croma (a/b) já estava correto, então era puramente falta do passo E do
item 38 (mescla com a galeria, força 0,75). R² baixo (0,14-0,18) confirma
que não havia sombra direcional real a corrigir — só a mescla mesmo.
Aplicada, ΔL foi para -16 nas duas faces. Junta empilhada 0,00, papel nas
bordas ~0%. Cache-bust + bump v18.

Lembrete: ao herdar/auditar textura de sessão desconhecida, sempre medir
ΔL contra a galeria antes de assumir que está tudo certo — nem toda
textura no repo passou pelo pipeline completo do item 38.

---

## 49. Rastreio de conversão estendido a popups e sidebar; painel de atendentes ganha adicionar/remover; correção do erro 500 em ordens/atendimento (22/07/2026)

**Rastreio (gclid/UTM/código de referência via `window.brutoWhatsappHref`)
estava presente em botões diretos, calculadora e guias em PDF, mas
ausente em dois pontos dinâmicos:**
- Popup de exit-intent (`exit-intent.js`): o CTA de WhatsApp da tela de
  confirmação era um `<a href>` estático com número fixo, criado depois
  do carregamento da página — fora do alcance da reescrita de links
  estáticos do `whatsapp-atendimento.js`. Trocado por um botão que
  chama `brutoWhatsappHref` no clique.
- Popup de frete grátis (`promo-frete-gratis.js`): mesmo problema,
  mesma correção.

**Botão "Solicitar amostra" do header/sidebar (`.header__cta`)** antes
sempre levava pra `index.html#amostra`, perdendo o contexto de produto
quando clicado a partir de uma página de produto. Agora intercepta o
clique (`interceptarHeaderCta()` em `whatsapp-atendimento.js`) e abre o
WhatsApp direto, citando o produto da página quando existir
(`data-product-name`/`data-product-line` do botão da calculadora),
passando pelo rodízio e pelo rastreio normalmente. Fallback pro
comportamento antigo se `brutoWhatsappHref` falhar.

**Bug de cache descoberto durante o teste em produção:** os três
scripts acima já estavam no ar com o conteúdo novo, mas o carimbo de
versão na tag `<script src="...?v=N">` não tinha mudado — navegadores
continuaram servindo a cópia antiga do cache. Corrigido com bump de
versão nas 34 páginas que carregam esses scripts
(`whatsapp-atendimento.js` v1→v2, `promo-frete-gratis.js` e
`exit-intent.js` v2→v3). Lição: qualquer edição de conteúdo de `.js`
carregado com cache-bust por versão precisa vir acompanhada do bump da
versão em todas as páginas que o referenciam, nunca só do conteúdo.

**Painel de rodízio de atendentes** (`interno/atendimento-whatsapp.html`)
ganhou adicionar/remover atendente (antes só tinha toggle ativo/inativo).
Dois pares de ponte pública + lógica real:
`interno/atendimento-adicionar.php` e `interno/atendimento-remover.php`
(git-safe) → `bruto-secrets/API/atendimento-adicionar.php` e
`atendimento-remover.php` (não git-safe, upload manual). Normaliza
número com ou sem DDI 55, bloqueia duplicado, atendente novo sempre
entra inativo por segurança, remoção bloqueada se for o único ativo.

**Erro 500 em `/ordens/` e `/atendimento/` quando acessados pelo domínio
principal** (em vez do subdomínio dedicado): as 9 pontes públicas
assumiam um número fixo de níveis até `bruto-secrets/` via
`dirname(dirname($_SERVER['DOCUMENT_ROOT']))`, que só é válido quando
`DOCUMENT_ROOT` já é a pasta do subdomínio. Reescritas pra tentar os
dois caminhos possíveis (subdomínio e domínio principal) antes de
desistir, com erro JSON legível em vez de 500 mudo se nenhum funcionar.

Também: nova página `/bio/` (link-na-bio do Instagram) com relatório de
cliques próprio — fora deste repositório de commits porque foi criada
e testada em sessão separada de chat, não documentada aqui em detalhe.

---

## 50. Base de conhecimento da ferramenta de atendimento técnico ganha bloco de paginações (22/07/2026)

O Rafael perguntou se dava pra inserir o conteúdo do guia PDF de aplicação
(oferecido no popup de exit-intent) na base de conhecimento da ferramenta
de atendimento técnico (`atendimento/index.html`, objeto `KB`).

Comparação mostrou que o **Guia de Aplicação** já estava coberto — o bloco
`KB.instalacao` existente é mais detalhado que o PDF (seções de 60×60cm,
tempo de trabalho, regra de 3 caixas, escalonamento por irregularidade).
Nada a adicionar ali.

O **Guia de Paginações** (25 padrões de assentamento do Brick, 10 páginas,
`guia-paginacoes-bruto.pdf`) era uma lacuna real — nenhum dado sobre
padrões de assentamento existia na KB antes disso. Extraído texto completo
via `pdfplumber` e adicionado `KB.paginacoes`, organizado nas mesmas 4
famílias do PDF (Corrido, Clássico, Geométrico, Especial), com nome,
dificuldade, ambiente recomendado e tags de cada um dos 25 padrões, mais
uma regra de atendimento cruzando dificuldade × experiência do instalador
do cliente e recomendações por caso de uso (fachada externa vs. parede de
destaque interna).

Validação: como o objeto `KB` inteiro entra automaticamente no contexto
(`Object.keys(KB).forEach(...)`), bastou adicionar a chave — sem tocar em
mais nenhum lugar do código. Sintaxe confirmada parseando o objeto `KB`
isoladamente com `new Function()` antes do commit (o arquivo usa JSX/Babel
standalone, então `node --check` no arquivo inteiro não seria válido).

---

## 51. Exportação legível (HTML) do histórico de atendimento (22/07/2026)

O Rafael mandou um export JSON de sessões (produzido pelo botão "Exportar
histórico" já existente) e pediu uma forma de visualizar isso formatado,
igual à tela da própria ferramenta, sem precisar interpretar JSON cru.

Adicionado botão "Exportar leitura" (ícone FileText) ao lado do de
exportar JSON. Reaproveita exatamente a mesma coleta de sessões do
`exportHistory()` já existente (servidor + cache local), mas monta um
documento HTML autocontido com a mesma paleta/tipografia do app (Syne +
DM Sans + Barlow Condensed, tokens de cor teal/bg/surface/card idênticos
aos definidos em `S`) — bolhas de mensagem por cliente/assistente, tags,
metadados de geração (modo/KB/modelo) e imagens inline via data URL.

Abre em aba nova via `window.open('', '_blank')` + `document.write()`,
disparado já dentro do clique (antes do `await` da coleta assíncrona) pra
não ser bloqueado como pop-up. Se mesmo assim for bloqueado, cai no mesmo
modal de copiar/colar já usado pela exportação JSON — por isso o estado
`exportModal` mudou de `string` pra `{ content, ext }`, permitindo o
modal adaptar rótulo e instrução (.json vs .html) conforme o tipo.

Testes: compilação real do JSX via `@babel/standalone` (arquivo inteiro,
139k+ chars, sem erro) e teste isolado da função de montagem do HTML com
dados adversariais (nome de cliente com `<script>`/aspas/&) confirmando
escape correto — sem isso, conteúdo digitado por um cliente no chat
poderia injetar HTML/JS no export.

---

## 52. Página /bio/ derrubada por deploy do Git — trazida pro repositório (22/07/2026)

A pasta `/bio/` (link-na-bio do Instagram, criada em sessão de chat
separada) e os endpoints `api/bio-clique.php`, `api/bio-relatorio.php`,
`api/bio-zerar.php` nunca tinham sido commitados no Git — foram sempre
upload manual direto no `public_html`, fora de qualquer controle de
versão.

O Rafael reportou `brutoceramica.com.br/bio/relatorio.html` retornando
o 404 padrão do site principal (evidenciado pelos assets errados que o
navegador tentou carregar: `styles.css`/`whatsapp-atendimento.js`
relativos a `/bio/`, que são do site, não da bio). Hipótese: o deploy
via Git da Hostinger espelha o `public_html` exatamente pelo conteúdo do
repositório, apagando qualquer arquivo/pasta que não esteja versionado
— e a sequência de commits das últimas sessões (itens 49-51) deve ter
apagado a pasta `/bio/` inteira por não estar rastreada.

Correção: trazidos `bio/index.html`, `bio/relatorio.html`,
`api/bio-clique.php`, `api/bio-relatorio.php`, `api/bio-zerar.php` pro
repositório (todos git-safe, sem segredo). O `bio-config.php` (a chave
do relatório) continua fora do Git, em `bruto-secrets/API/`, e não foi
afetado por não estar em `public_html`.

Lição: qualquer pasta/arquivo em `public_html` que dependa de
sobreviver a um próximo deploy precisa estar no Git — upload manual
"paralelo" ao repositório é uma armadilha que só aparece quando o
próximo commit acontece.

---

## 53. Bio: botão de WhatsApp não abria em nova aba (22/07/2026)

O Rafael notou que clicar em "Falar com um consultor" na `/bio/` fechava
a própria página em vez de abrir o WhatsApp numa aba nova, persistindo a
bio. Causa: o link de WhatsApp nasce com `href="#"` (placeholder — o
número real só chega depois, via rodízio), e a lógica que marca
`target="_blank"` só rodava pra links que já nascessem com `http` no
href — então o WhatsApp nunca era marcado, mesmo depois do href ser
trocado pelo `wa.me` de verdade. Corrigido: todo link da parede agora
sempre abre em nova aba, incondicionalmente.
