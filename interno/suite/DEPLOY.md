# DEPLOY — Suíte Bruto by UP

> **Nota sobre este arquivo (12/08/2026):** o `DEPLOY.md` e o `ARQUITETURA-BRUTO.md`
> originais (mencionados no `SUITE-briefing-nova-sessao.md`) não estavam
> presentes no repositório quando o código da Suíte foi versionado em
> `interno/suite/` (commit `1e1a24b`). Este arquivo foi reconstruído a partir
> do resumo já registrado no briefing + inspeção direta do código real desta
> pasta. **Se existir uma versão mais completa/detalhada em algum lugar (zip
> antigo, outra sessão, Google Drive), cole aqui por cima** — o que está
> escrito abaixo é o mínimo confirmável, não necessariamente tudo que o
> `DEPLOY.md` original continha.

Ver também `COLABORACAO.md` na raiz do repositório para o protocolo de Git
(clone/pull, diff cirúrgico, confirmação antes de push) — este arquivo cobre
só o que é específico do deploy da Suíte.

**Nota (12/08/2026) — cuidado com pacotes de `bruto-secrets/API/`:** um download
direto da pasta real do servidor traz **todos** os arquivos que moram lá,
inclusive os do site principal (Atendimento, Ordem de Serviço, Rodízio de
WhatsApp, Portal Faion) — não só os `suite-*.php`. Só os arquivos com prefixo
`suite-` (`suite-auth.php`, `suite-login.php`, `suite-logout.php`,
`suite-me.php`, `suite-base.php`, `suite-ia.php`, `suite-leads.php`,
`suite-ordens.php`, `suite-pulso.php`, `suite-team.php`, `suite-vault.php`,
`suite-voice.php`) são da Suíte. `config.php` e `conexao.php` são
infraestrutura compartilhada entre os dois. O resto (`atendimento-*.php`,
`chat.php`, `whatsapp-*.php`, `usuarios.php`, `auth-lib.php`, etc.) é do site
principal — não editar aqui sem também colar o `bruto-briefing-nova-sessao.md`.
Um desses arquivos soltos (`leitor-projeto.php`, do site principal) já
apareceu com uma chave de API da Anthropic hardcoded em texto puro — se
reaparecer, é sinal de chave exposta, revogar e trocar.

---

## 1. Fases

1. **Fase 0** — pré-requisitos únicos, antes de tudo (ver checklist §2)
2. **Fase 1** — Suíte no ar, protegida, `DEMO_MODE` ainda `true`
3. **Fase 2** — UP·Flow com dado real (menor risco, maior retorno)
4. **Fase 3** — UP·Lead
5. **Fase 4** — UP·Vault
6. **Fase 5** — UP·Base, UP·Team, UP·Voice
7. **Fase 6** — UP·Dash e UP·GOS
8. **Virada de `DEMO_MODE` para `false`** — decisão única, não incremental, só
   depois que **todas** as fases 2–6 estiverem testadas isoladamente
9. **Fase 7** — cron dos alertas proativos (UP·Voice), só depois da virada

Estado confirmado nesta data (commit `1e1a24b`, via `grep` direto em
`config.js`): **`DEMO_MODE = true`** — correto pra Fase 1.

---

## 2. Checklist operacional (nível hPanel/servidor, não código)

Nada aqui é automatizado pelo deploy do Git — são passos manuais no Hostinger.

- [ ] Decidir e criar a rota de acesso: subdomínio próprio
      (`up.brutoceramica.com.br`) **ou** domínio principal em `/suite/`
      — ver §4 "Estado do servidor" abaixo pra decisão vigente
- [ ] Copiar `_para-bruto-secrets/*` do pacote pra `bruto-secrets/API/` no
      servidor, **fora do `public_html`** (nunca vai pro Git)
- [ ] Rodar `migracao.sql` no banco (`u764636502_bruto_interno` ou o schema
      correto da instância) — **conferir antes se a collation `#1267` de
      `lead_pipeline.sessao_id`/`amostra_envio.sessao_id`
      (`utf8mb4_uca1400_ai_ci`) e a tabela `followup_anexos` estão no arquivo**,
      já voltaram a faltar uma vez
- [ ] Gerar hash de senha de cada pessoa via CLI (nunca por site aleatório):
      ```bash
      php -r "echo password_hash('SENHA_AQUI', PASSWORD_BCRYPT, ['cost' => 12]) . PHP_EOL;"
      ```
- [ ] Subir o restante do pacote público: `api/`, `.htaccess`, os `.html`,
      `nav.js`, `auth-guard.js`, `config.js` — isso já vem do Git a partir do
      commit `1e1a24b` se o deploy automático estiver de fato configurado
      pra essa pasta (confirmar — ver §4)
- [ ] Confirmar `ANTHROPIC_API_KEY` disponível via `getenv()` no ambiente do
      servidor (usada por UP·Lead follow-up e narrativas)

---

## 3. Bloqueador conhecido — proteção por papel ainda não implementada no backend

**Atualizado (12/08/2026) após inspecionar o código real de `bruto-secrets/API/`
(zip baixado direto do servidor):** a função `suite_bloqueia_atendente()`,
que o briefing e o comentário em `auth-guard.js` descrevem como a proteção
real no backend, **não existe em nenhum arquivo `suite-*.php`**. O que existe
é `suite_exige_sessao()` em `suite-auth.php`, que confirma sessão válida
(login feito, não expirado, mesmo user-agent) mas **não checa `papel` pra
nada** — nenhum módulo (`suite-base.php`, `suite-team.php`, `suite-vault.php`,
`suite-voice.php`, `suite-pulso.php`, `suite-ordens.php`) faz essa checagem
internamente.

**Isso é mais sério do que "o Gabriel toma 403 por engano":** hoje, qualquer
usuário autenticado — `atendente` incluso — consegue acessar os endpoints de
Vault/Team/Voice/Pulso/Ordens direto pela API, mesmo que `auth-guard.js`
redirecione visualmente quem tenta abrir a página pelo navegador. A proteção
real por papel ainda **não está implementada no servidor**, não é só uma
questão do papel do Gabriel estar errado no banco.

**Duas coisas precisam ser resolvidas antes da Fase 1 ir ao ar, não uma:**
1. Implementar a checagem de `papel` em `suite_exige_sessao()` (ou função
   equivalente chamada por cada módulo restrito), rejeitando com 403 quem tem
   `papel === 'atendente'` fora de Lead/Base — igual ao que `auth-guard.js`
   já faz no front, mas no lugar que realmente protege.
2. **Decisão pendente do Rafael:** criar papel novo `'socio'` vs. promover o
   Gabriel pra `'admin'` no banco real — necessária de qualquer forma, mas só
   resolve o problema depois que o item 1 acima também existir.

Nenhuma sessão consegue confirmar o papel do Gabriel no banco só pelo código
— esse dado vive no MySQL, não em arquivo. Mas a ausência da função de
bloqueio, essa sim, é verificável directly no código sempre que alguém tiver
acesso a `bruto-secrets/API/*.php` (via zip ou FTP/hPanel).

---

## 4. Estado do servidor (Hostinger) — preencher/atualizar manualmente

Esta seção existe porque **nenhuma sessão de Claude enxerga o servidor
Hostinger automaticamente** — nem via Git (que só reflete código, não o que
está de fato instalado/configurado lá), nem por conector nenhum disponível
até agora. O que estiver escrito aqui só vale se **alguém confirmou
diretamente no hPanel/FTP** e atualizou a data. Sem data recente, tratar como
desatualizado — igual à regra que valia pro zip antes do Git existir.

| Item | Estado confirmado | Confirmado em | Por quem/como |
|---|---|---|---|
| Rota de acesso ativa (subdomínio vs. domínio principal `/suite/`) | _(preencher)_ | | |
| `_para-bruto-secrets/*` copiado pra `bruto-secrets/API/` fora do `public_html` | ✅ confirmado — pasta existe e tem os `suite-*.php` reais | 12/08/2026 | zip baixado do servidor, anexado na conversa |
| Checagem de `papel` (`atendente` bloqueado) implementada no backend | ❌ **não implementada** — `suite_bloqueia_atendente()` não existe em nenhum `suite-*.php`; `suite_exige_sessao()` só valida sessão, não papel | 12/08/2026 | leitura direta do código em `suite-auth.php` |
| `migracao.sql` já rodado no banco de produção | _(preencher — não veio neste zip, só a pasta `api/`)_ | | |
| Collation `#1267` aplicada em `lead_pipeline`/`amostra_envio` no banco real | _(preencher — precisa de `migracao.sql` ou acesso ao banco, não veio neste zip)_ | | |
| Tabela `followup_anexos` existe no banco real | _(preencher — mesmo caso acima)_ | | |
| Hash de senha gerado pra cada pessoa (Rafael/Gabriel/outros) | _(preencher — comando confirmado correto em `suite-auth.php`: `password_hash(..., PASSWORD_BCRYPT, ['cost'=>12])`)_ | | |
| Papel do Gabriel no banco real (`atendente` / `socio` / `admin`) | _(preencher — dado vive no MySQL, não em arquivo)_ | | |
| Deploy automático do Git realmente publicando `interno/suite/` no servidor | _(preencher — não verificável por este zip, que é só `bruto-secrets/API/`)_ | | |
| `ANTHROPIC_API_KEY` configurada no ambiente do servidor | ⚠️ parcial — código de `suite-ia.php` usa `getenv('ANTHROPIC_API_KEY')` corretamente (sem hardcode), mas não dá pra confirmar se a variável está de fato setada no servidor sem acesso ao painel/SSH | 12/08/2026 | leitura direta do código |
| `.htaccess` da Suíte (bloqueio de `.md`/`.sql`/HTTPS forçado) já subiu pro servidor | _(preencher)_ | | |

**Como manter isso útil:** sempre que alguém checar algo no servidor — mesmo
que só pra confirmar que nada mudou — atualizar a linha com a data. Uma sessão
futura deve tratar uma linha sem data recente exatamente como tratava um zip
antigo: não confiar, pedir confirmação de novo antes de agir sobre aquele
item.

---

## 5. Pendências fora do escopo de deploy imediato

- Vault com IA lendo arquivo/imagem em lote — não iniciado, proposta de
  arquitetura ainda em discussão.
- Tutorial guiado (onboarding) no primeiro acesso — registrado como
  pendência, não construído.
- `suite-ordens-CORRIGIDO.php` e `.htaccess` soltos — se reaparecerem em
  algum pacote, descartar; a correção real (`numero_os` derivada do `id`)
  já está em `suite-ordens.php`/no backend de produção.
