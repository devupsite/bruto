# SUÍTE BRUTO BY UP — Briefing de Contexto para Nova Sessão

**Cole este arquivo no início de qualquer conversa nova que for trabalhar na Suíte
Bruto by UP** — antes de pedir qualquer tarefa. Ele é **complementar** ao
`bruto-briefing-nova-sessao.md` do site/ferramentas principais da Bruto (Atendimento,
Ordem de Serviço, Precificador, Portal Faion) — **não o substitui**. Se a tarefa
também tocar em produto, preço, política de frete/amostra ou infraestrutura do site
principal, cole os dois.

Este arquivo é sobre a **Suíte Bruto by UP** — que deixou de ser um "projeto ainda
não implantado" faz tempo: está em **produção real**, com backend real, desde
08/08/2026, e passou por uma rodada extensa de correções e features novas em
20-24/08/2026 (ver seção 10, a mais nova deste documento).

---

## 0. A regra mais importante deste documento inteiro

**A Suíte vive no Git, na pasta `up/` (raiz do repositório) — não mais em
`interno/suite/`.** Isso mudou em 21/08/2026 e é importante entender por quê,
porque é uma lição de arquitetura, não só um detalhe de caminho:

A Suíte nasceu (Fase 1, commit `1e1a24b`) dentro de `interno/suite/` só pra
**herdar de carona** a proteção Basic Auth que já existia em `/interno/`
(usada por Precificador e Atendimento) — um atalho válido enquanto a Suíte
ainda não tinha login próprio. Só que ela **nunca foi servida daquele
caminho**: sempre rodou de verdade em `public_html/up/`, com login e sessão
própria (`login.html`, `auth-guard.js`, cookie `BRUTOSUITE`). O caminho no
Git e o caminho real do servidor divergiam silenciosamente.

**Isso causou um apagão real**: o deploy automático do Hostinger via Git
espelha `public_html` contra o conteúdo do repositório — qualquer coisa em
`public_html` que não esteja versionada é apagada a cada push, mesmo um push
de outra ferramenta sem nenhuma relação com a Suíte. Como `up/` nunca esteve
no Git, um deploy qualquer apagou a pasta inteira do servidor, com toda a
produção real dentro. A mesma classe de problema já tinha acontecido antes
com `/bio/` e o painel de atendentes (ver `COLABORACAO.md` do repositório) —
essa é a terceira vez que esse padrão de erro se repete, então trate como
regra permanente, não como acidente isolado: **nada que precise sobreviver a
um deploy pode existir em `public_html` sem estar no Git no caminho exato
onde é servido.**

Por isso, hoje:

- **`git clone` (ou `git pull` se já clonado) antes de qualquer coisa.** O
  estado real está no repositório, em `up/`.
- **Nunca confie na narrativa de uma sessão anterior sem conferir.** Esse
  hábito vale ainda mais agora — este próprio documento já ficou desatualizado
  uma vez (descrevia `DEMO_MODE=true` e Fase 1 enquanto a produção real já
  rodava com backend de verdade há dias). Sempre `grep`/`cat` no arquivo real
  depois do clone/pull.
- **`git log --oneline -1` é o ponto de reversão real.**
- Se a pessoa colar um `.zip` numa conversa futura, trate como
  complementar/experimental — o repositório é a fonte de verdade.

---

## 1. O que a Suíte é (e o que não é)

A Bruto já tem quatro ferramentas de produção, cobertas pelo outro briefing:
Atendimento Técnico, Ordem de Serviço, Precificador, Rodízio de WhatsApp — mais o
Portal Faion (fornecedor).

A **Suíte Bruto by UP** é uma camada de **visão executiva** por cima dessas
ferramentas — responde "como está o negócio esta semana", não "como respondo este
cliente". Regra de ouro: **sempre que um módulo da Suíte precisar de um dado que já
existe numa ferramenta de produção, ele lê de lá. Nunca duplica, nunca reescreve.**
Exemplo mais recente dessa regra em ação: a sincronização seletiva
Atendimento → UP·Lead (seção 10) lê e escreve só em tabela própria da Suíte
(`lead_pipeline`), nunca em `sessoes_atendimento`.

Vocabulário e regras de negócio (funil, tipos de cliente, SLAs, cadência de
follow-up) vivem no objeto `BRUTO_OPS` dentro de `config.js`. Identidade visual
(paleta, tipografia) vive no objeto `BRAND`, também em `config.js` — **atenção
especial aqui, ver seção 3.**

---

## 2. Os módulos e o escopo ativo

10 módulos existem no código, mas só 8 estão na navegação. Isso é controlado por
`SUITE_LAYOUT` em `config.js`.

| Grupo | Módulos | Racional |
|---|---|---|
| **Núcleo** (uso diário) | UP·Dash, UP·Lead, UP·Flow, UP·Vault | Cobrem o ciclo inteiro: visão → funil → pedido → dinheiro |
| **Apoio** (consulta pontual) | UP·Base, UP·Voice, UP·GOS, UP·Team | Valiosos, mas não abertos todo dia |
| **Adiado** (fora da navegação, mas no código) | UP·Core, UP·Mind | Sem mudança de status |

Arquivos: `up-dash.html`, `up-lead.html`, `up-flow.html`, `up-vault.html`,
`up-base.html`, `up-voice.html`, `up-gos.html`, `up-team.html`, `up-core.html`,
`up-mind.html` — mais `login.html`, `nav.js`, `auth-guard.js`, `config.js` — todos
em **`up/`**, raiz do repositório (não `interno/suite/`, ver seção 0).

A Suíte inteira roda no **domínio principal** (`brutoceramica.com.br/up/`), não
num subdomínio — decisão confirmada e definitiva, refletida inclusive no
comentário do `.htaccess` da pasta (que antes citava por engano um plano de
subdomínio nunca usado).

---

## 3. `config.js` — o arquivo que toda sessão deve inspecionar primeiro

- `CLIENT_CONFIG` — identidade, financeiro, comercial, estratégia da instância Bruto
- `BRUTO_OPS` — funil, tipos de cliente, SLAs, cadência de follow-up, regras de amostra
- `SUITE_LAYOUT` — núcleo/apoio/adiado
- `DEMO_MODE` — **hoje é `false`.** A Suíte roda com backend real desde 08/08/2026.
  Se você encontrar `true`, é regressão — a Suíte já operou em produção por mais de
  uma semana antes disso, não é mais uma decisão "ainda não chegamos lá".
- `BRAND` — **atenção: identidade visual real da marca UP Co.**, não da Bruto
  isolada. Paleta correta: fundo `#0F0F0F`, texto `#F2F2F2`, cinzas `#606060`/
  `#888888`, borda `#2E2E2E`, **accent teal `#57999B`** (não mais o terracota
  `#D44000` que era usado antes por engano). Tipografia: **Barlow / Barlow
  Condensed** (identidade visual da própria Bruto — Syne/DM Sans do brandbook
  genérico da UP Co. foram avaliados e explicitamente rejeitados pra esta
  instância).

  **Achado importante (21/08/2026), guarde isso**: `config.js` tem uma função
  `applyBrand()` que roda assim que o script carrega e aplica todo `BRAND` como
  **estilo inline** em `<html>` via `.style.setProperty()`. Estilo inline tem
  prioridade máxima sobre qualquer `:root{}` de CSS, não importa a ordem dos
  `<script>`. Se você mudar cor da marca em `nav.js` (ou em qualquer CSS) e não
  mudar aqui também, a mudança **não vai aparecer em lugar nenhum** — não por
  cache, não por bug de navegador, mas porque este arquivo sobrescreve
  silenciosamente por cima. Já causou uma sessão inteira de investigação
  equivocada (achando que era extensão de navegador) antes de ser encontrado.

**Antes de mexer em qualquer módulo, confira o valor atual de `DEMO_MODE` e de
`BRAND.teal` em `up/config.js` depois de `git clone`/`git pull`.**

---

## 4. Segurança — mesmo padrão do site principal, sem exceção

- Pastas do pacote: `bruto-secrets/API/` (destino final no servidor, **nunca vai
  pro Git**) e `up/api/` (pontes públicas de ~10 linhas, essas sim vão pro Git —
  não contêm segredo nenhum, só fazem `require` do arquivo real fora do
  `public_html`).
- Arquivos reais em `bruto-secrets/API/` seguem o padrão `suite-*.php`:
  `suite-auth.php`, `suite-vault.php`, `suite-team.php`, `suite-base.php`,
  `suite-leads.php`, `suite-ordens.php`, `suite-pulso.php`, `suite-voice.php`,
  `suite-login.php`, `suite-logout.php`, `suite-me.php`, `suite-ia.php`,
  `historico.php` (este último é do Atendimento, não tem prefixo `suite-`, mas
  mora na mesma pasta porque a sincronização seletiva escreve em tabela da
  Suíte a partir de lá — ver seção 10).
- Toda ponte pública em `up/api/*.php` segue o padrão de tentar dois caminhos de
  `require` (mesma regra do site principal).
- Autenticação: sessão própria (`BRUTOSUITE`), cookie `httponly` + `secure` em
  HTTPS + `samesite=Strict`, senha sempre `password_hash(...,
  PASSWORD_BCRYPT, ['cost'=>12])`.
- Chave da API Anthropic vem de `getenv('ANTHROPIC_API_KEY')` — nunca hardcoded.
  `suite-ia.php` (proxy de IA da Suíte) já suporta blocos de imagem/PDF na
  chamada pra Anthropic (adicionado 22/08/2026, pro UP·Vault ler recibo/nota via
  IA — ver seção 10).
- Qualquer token de Git colado em conversa é considerado exposto — revogar e
  gerar novo assim que possível, mesmo que "ainda vale por mais algumas horas".
  Nunca reutilizar token de uma sessão anterior por padrão — só se a pessoa
  confirmar explicitamente que quer.

---

## 5. Bugs já corrigidos — não reintroduzir

- **Caminho do repositório divergente do caminho real do servidor** (ver seção
  0) — a causa raiz do apagão de 21/08/2026. Não recriar uma pasta da Suíte em
  lugar diferente de `up/` por conveniência (ex: herdar proteção de outra
  pasta) sem entender que isso desprotege contra deploy.
- **`BRAND.teal` sobrescrevendo `:root` via estilo inline** (seção 3) — sempre
  mudar cor da marca nos dois lugares (`config.js` E qualquer CSS que também
  declare a mesma variável), ou melhor: mudar só em `config.js`, que é a fonte
  de verdade real.
- **Geometria do logo**: o ícone da Bruto no menu lateral é dois retângulos
  vazados sobrepostos (o de baixo mais largo) — não um path SVG genérico. Já
  foi reconstruído a partir do vetor real da marca; não reinventar sem
  conferir o arquivo de logo oficial.
- **Pipeline do UP·Lead sem scroll interno**: colunas do Kanban cresciam além
  do espaço disponível em vez de rolar, escondendo leads. Causa raiz real:
  `.pipeline-panel` tinha `flex-direction:column` sem `display:flex` — sem
  isso, nenhuma propriedade flex nos filhos faz efeito. Lição: um elemento
  flex sem `min-height:0` nunca encolhe abaixo do tamanho do conteúdo, mesmo
  com container pai limitado — sempre checar isso em cadeias de flex
  aninhadas que devem conter rolagem.
- **Deal resetava de etapa ao reabrir pela conversa**: o formulário "Criar
  deal" (aberto a partir da conversa de um lead) sempre usava a etapa
  padrão do `<select>`, mesmo pra um lead que já tinha deal avançado —
  salvar sobrescrevia silenciosamente de volta pro início. Corrigido
  detectando deal existente e preenchendo a etapa atual — e bloqueando de
  vez se a etapa atual (`Pedido`/`Perdido`) nem está entre as opções do
  formulário rápido (essas só mudam pelo Pipeline, arrastando).
- **Valor do deal cortado no card do Pipeline**: `.pipeline-card-footer`
  tentava colocar valor e badge lado a lado sem espaço suficiente. Vira
  coluna (`flex-direction:column`) em vez de linha.
- **Importação por IA no UP·Vault, parse de JSON frágil**: modelo às vezes
  embrulha resposta em ` ```json ... ``` ` mesmo pedindo explicitamente só
  JSON puro — sempre limpar cerca de código antes de `JSON.parse()`.
- **Salvamento em lote sem rastreamento por item**: uma falha de validação
  num item entre vários (ex: 1 de 12 recibos importados) já mostrava toast
  de erro isolado só daquele item, mas o fluxo seguia até o fim e ainda
  disparava toast de sucesso geral — mentindo sobre o resultado real.
  Corrigido: só fecha e comemora se **todos** salvaram; se algum falhar, o
  modal continua aberto só com quem falhou.
- **Collation `#1267`:** `lead_pipeline.sessao_id` e `amostra_envio.sessao_id`
  precisam de `CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci` explícito.
- **Tabela `followup_anexos` ausente do `migracao.sql`** — já corrigido lá.

---

## 6. Deploy — estado atual, não mais fases hipotéticas

A Suíte está em produção real. O fluxo de deploy hoje é:

1. Editar em `up/` (código público, seguro) → commit → **push com confirmação
   explícita da pessoa antes de qualquer push, sempre** → deploy automático do
   Hostinger cuida do resto.
2. Editar em `bruto-secrets/API/` (lógica real, segredo) → **nunca vai pro
   Git** → a sessão entrega o arquivo pra a pessoa baixar e subir manualmente
   no servidor (fora do `public_html`).
3. Mudança de schema de banco → SQL entregue pra pessoa rodar direto no
   phpMyAdmin (a sessão não tem acesso a banco).

Não existem mais "fases" no sentido do documento antigo (Fase 1 a 7) — isso
descrevia o caminho até a primeira virada de `DEMO_MODE`, que já aconteceu.

---

## 7. Pendências conhecidas (não assumir que foram resolvidas)

- 🔴 **Tutorial de primeiro acesso (onboarding)** — nunca foi iniciado. Único
  item de feature grande ainda em aberto, além do que está listado abaixo.
- ⚠️ **Papel `'visualizador'`** — apareceu no `ENUM` da coluna `papel` da
  tabela `usuarios` ao lado de `admin`/`socio`/`atendente`, sem ninguém saber
  documentar pra que serve nem quem o usa. Não mexer nele sem primeiro
  descobrir a origem — só ficou registrado como mistério não resolvido.
- A exceção de escrita do sócio no UP·Vault (seção 10, item de 23/08/2026)
  usa um campo `origem` mandado pelo próprio navegador pra liberar só a
  importação via IA — **não é uma trava de segurança forte**, é só proteção
  contra clique acidental na função errada pela UI normal. Documentado
  explicitamente assim no próprio `suite-vault.php`. Se algum dia precisar
  ser inviolável de verdade, o servidor precisaria confirmar que a criação
  realmente passou pela extração da IA, não só confiar no campo enviado.

---

## 8. Guia de commit — mesmo procedimento do site principal, + práticas
importadas do repositório `devupsite/visualizador-revestimentos` em
24/08/2026 (colaboração entre sessões daquele projeto é mais madura nesse
aspecto — vale reaproveitar)

1. `git clone`/`git pull` antes de tocar em qualquer arquivo
2. `git log --oneline -1` — ponto de reversão
3. Diff cirúrgico: mudar só o que foi pedido. **Não delete nem reescreva
   arquivo inteiro de funcionalidade fora do escopo da tarefa atual, mesmo
   que pareça "melhorável"** — se notar algo assim, anote na seção 11
   (Log de sessões) em vez de mexer por conta própria.
4. **Commits pequenos e atômicos — não acumule o trabalho da sessão
   inteira pra um commit só no final.** Dê push a cada parte funcional
   concluída, não espere terminar tudo. Isso não é só estilo: um commit
   feito localmente e nunca enviado se perde por completo se o sandbox
   reiniciar antes do push — já aconteceu exatamente isso com a primeira
   versão da importação por IA do Vault (22/08/2026), precisou ser
   reconstruída do zero porque ficou um dia inteiro de trabalho preso
   local sem chegar no GitHub.
5. `git add` + `git commit -m "descrição clara"` (ex: `feat: adiciona X`,
   nunca `updates`)
6. **`git fetch origin` de novo antes de cada push** — outra sessão pode ter
   empurrado algo enquanto você trabalhava (aconteceu várias vezes em
   20-24/08/2026, sempre sem conflito real porque as áreas não se
   sobrepunham, mas sempre checar, nunca assumir).
7. `git diff --cached --stat` + **pedir confirmação explícita antes de
   qualquer push, sem exceção**
8. Push com `x-access-token` explícito na URL + `GIT_ASKPASS=/bin/true`
9. Confirmar com `git fetch` (não só `git log` local) que o push chegou
10. **Nunca `force push` nem reescrever histórico** (`rebase -f`,
    `push --force`) — histórico é a única forma de outra sessão entender o
    que mudou e por quê.
11. Token colado em conversa = token exposto → revogar e gerar novo. Se a
    pessoa disser pra reaproveitar um token já usado antes na mesma
    conversa, pode aceitar (a decisão é dela, o token já estava exposto de
    qualquer forma) — mas nunca sugerir isso por iniciativa própria.

**Seja honesto sobre o nível real de validação, sempre.** "Sintaxe válida"
(`node --check`, `php -l`) e "funciona de verdade" são coisas diferentes —
vários bugs desta sessão (parse de JSON do Vault, salvamento em lote
mentindo sobre sucesso, cor da marca) só apareceram depois de teste real,
apesar de terem passado limpo por validação estática antes. Ao relatar
status (pra pessoa ou na seção 11), diga explicitamente qual dos dois você
fez — nunca deixe implícito que "validado" significa "testado".

**Cuidado com o editor de arquivo do gerenciador Hostinger** (se algum dia
usado em vez de sandbox local): autoclose de crase/parêntese/chave já causou
duplicação de conteúdo várias vezes. Preferir edição via script (Python
`str.replace` com `assert count==1` antes de gravar) a digitar direto num
editor com autoclose, sempre que possível.

---

## 9. Como pedir ajuda numa sessão nova, de forma eficiente

- Anexe **este arquivo** e peça `git clone https://github.com/devupsite/bruto.git`
  — o código da Suíte está em `up/`.
- Se a tarefa tocar o site/ferramentas principais, anexe também o
  `bruto-briefing-nova-sessao.md` e o `COLABORACAO.md` do repositório.
- Se uma sessão anterior relatou ter corrigido algo, **peça pra sessão nova
  conferir por `grep`/`cat` no repo clonado antes de aceitar.**
- Se precisar de um arquivo de `bruto-secrets/API/`, a pessoa pode trazer via
  upload direto ou reaproveitar um backup já baixado antes na mesma conversa
  (ex: um `.zip` do Google Drive) — não precisa pedir de novo arquivo por
  arquivo se o pacote completo já foi compartilhado uma vez na conversa.

---

## 10. Log de sessões

**Formato adotado em 24/08/2026, extraído do repositório
`devupsite/visualizador-revestimentos`** (o `colaboracao.md` de lá mantém
essa prática há mais tempo e funciona bem). A partir de agora, **toda
sessão adiciona uma entrada nova no TOPO desta lista antes de terminar** —
nunca apaga nem reescreve entrada antiga, mesmo que pareça obsoleta. Cada
entrada deve dizer: o que foi feito, quais arquivos foram tocados, o
**status real** (concluído / EM ANDAMENTO, com o que falta) — e, seguindo
a seção 8, dizer explicitamente se foi só **validado estaticamente**
(sintaxe) ou **testado de verdade** (visual/funcional em produção).

> Toda sessão adiciona uma entrada nova no topo. Nunca apagar entradas antigas.

### [Adicionar aqui: data] — [Adicionar aqui: resumo da sessão]
- Arquivos alterados:
- Status: (concluído / EM ANDAMENTO — o que falta)
- Validação: (estática / testada de verdade — o quê exatamente)
- Notas para a próxima sessão:

### 24/08/2026 (continuação 2) — Vínculo Precificador → OS → UP·Vault, receita líquida automática
- Contexto: Rafael perguntou se o Vault não deveria puxar receita das OS já
  líquida (via regra do Precificador) em vez de lançamento manual/IA sobre
  recibo. Investigação confirmou que a ideia bate com a regra de ouro da
  Suíte, mas as 3 peças (OS real, Precificador, Vault) nunca se falavam —
  desenho aprovado pelo Rafael foi o "C" (vínculo exato, não estimativa).
- Achado no caminho: `transacoes.ordem_servico_id` **já existia** no banco
  (alguém previu esse vínculo antes, nunca foi usado) — reaproveitado em
  vez de criar coluna nova. Também achado: `origem` (adicionada em sessão
  anterior pra exceção do sócio) nunca era persistida de verdade na tabela,
  só lida pra checagem — corrigido nesta sessão também.
- Arquivos alterados:
  - `interno/precificador-comercial.html` (commit `b4aa22a`, já enviado) —
    `calcPrec()` guarda `S.custoTotal` (antes calculado e descartado);
    cenário salvo passa a incluir `resultado.estruturado` (números limpos:
    preço de venda, custo total, lucro líquido, margem %) além do resumo
    em texto que já existia.
  - `ordens/index.html` + `ordens/ordem-servico.js` (mesmo commit) — novo
    campo opcional "Cenário de precificação usado", populado via
    `listar-cenarios.php` (mesmo endpoint que o Precificador já usa).
  - `bruto-secrets/API/salvar-ordem.php` (entregue fora do Git) — lê o
    cenário pelo `cenario_id`, congela `custo_congelado`/`margem_congelada`
    na hora (não guarda link vivo — cenário genérico editado depois não
    deve mudar pedido já fechado).
  - `bruto-secrets/API/atualizar-status.php` (entregue fora do Git) —
    quando status vira `'concluído'`, sincroniza direto com `transacoes`
    (mesmo banco, sem passar pela API da Suíte — `atualizar-status.php`
    roda sob Basic Auth do site principal, não a sessão `BRUTOSUITE`, as
    duas autenticações são incompatíveis). Lança receita bruta sempre;
    custo só se a OS tinha cenário vinculado. Idempotente via
    `ordem_servico_id`.
  - `bruto-secrets/API/suite-vault.php` (entregue fora do Git) — `listar`
    devolve `origem`/`ordem_servico_id`; `criar` agora persiste `origem`
    de verdade.
  - `up/up-vault.html` (commit anterior a este) — categoria nova "Custo de
    mercadoria" adicionada nos 3 lugares onde a lista aparece.
  - Migração: `ALTER TABLE ordens_servico ADD cenario_id, custo_congelado,
    margem_congelada` + `ALTER TABLE transacoes ADD origem` (a segunda já
    confirmada rodada com sucesso pelo Rafael via phpMyAdmin; a primeira
    entregue mas status de execução não confirmado nesta sessão).
- Status: **EM ANDAMENTO**. Front-end do site principal commitado e
  enviado. Backend (3 arquivos PHP) entregue ao Rafael, mas **upload real
  no servidor ainda não confirmado** nesta sessão. Migração SQL parcial-
  mente confirmada (só a parte de `transacoes.origem`).
- Validação: **só estática** (`php -l` em todos os PHPs, `node --check` no
  JS/HTML) — nada testado de ponta a ponta ainda (criar OS com cenário
  vinculado → avançar status até concluído → conferir se aparecem as 2
  transações certas no Vault).
- Notas para a próxima sessão: antes de considerar isso pronto, confirmar
  (a) os 3 PHPs estão mesmo em `bruto-secrets/API/` no servidor, (b) a
  migração completa rodou (`DESCRIBE ordens_servico` deve mostrar as 3
  colunas novas), (c) teste real: criar uma OS vinculando um cenário
  salvo, avançar pra "concluído" no UP·Flow, e conferir se o Vault mostra
  as 2 transações (receita + custo) automaticamente, sem duplicar se o
  status for setado como concluído mais de uma vez.

### 20/08/2026 – 24/08/2026 — Rodada extensa de correções e features (resumo consolidado)
- Contexto: a Suíte tinha acabado de ser recuperada de um apagão total em
  `public_html/up/` (ver seção 0) — esta janela de dias cobre desde a
  reconstrução até uma bateria de features novas pedidas pelo Rafael.
- Arquivos/áreas alteradas (todos os commits já enviados e confirmados
  funcionando em produção, salvo indicação contrária):
  1. Correção real da paleta de marca — `BRAND.teal` em `config.js` (não
     `nav.js`) é quem manda de verdade (seção 3 e 5).
  2. Migração de caminho `interno/suite/` → `up/` — a correção estrutural
     que resolve o apagão de vez (seção 0).
  3. `DEMO_MODE` virou `false` — reconhecendo produção real havia mais de
     uma semana.
  4. Pipeline do UP·Lead: correção de scroll + bug de deal resetando etapa.
  5. Bloqueio de escrita na UI pro papel `'socio'`, complementar ao 403 que
     o backend já dava.
  6. Gabriel confirmado `'socio'` no banco real + "Sócio Fundador" no
     `cargo` de exibição do UP·Team (campos diferentes, não confundir).
  7. Mateus removido do rodízio real de atendimento e da tabela `membros`
     (`DELETE`, não só do seed).
  8. Sincronização seletiva Atendimento → UP·Lead via botão + coluna
     `lead_pipeline.sincronizado` — testada e confirmada pelo Rafael.
  9. UP·Vault — importação de recibo/nota em lote via IA (`suite-ia.php`
     estendido pra imagem/documento).
  10. Exceção de escrita pro sócio, só na importação por IA do Vault.
  11. Dois bugs reais corrigidos na importação por IA: parse de JSON
      frágil, e salvamento em lote que mentia sobre sucesso parcial.
- Status: concluído e confirmado em produção (itens 1-11 testados de
  verdade pelo Rafael ao longo da janela, não só validados estaticamente).
- Notas para a próxima sessão: nenhuma pendência desta janela específica —
  tudo que ficou em aberto está listado na seção 7 (pendências) ou nas
  entradas mais recentes deste log.

---

*Atualizado em 24/08/2026. Se esta conversa continuar depois de gerado,
este arquivo pode ficar desatualizado — sempre confira o repositório
(`git pull`) e a seção 11 (Log de sessões) antes de assumir que algo aqui
ainda vale. Isso já aconteceu com a versão anterior deste mesmo documento.*
