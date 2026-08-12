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

## 3. Bloqueador conhecido — papel do Gabriel (resolver antes da Fase 1 ir ao ar)

`suite_bloqueia_atendente()` (função server-side, vive em
`bruto-secrets/API/`, **fora do Git** — não dá pra confirmar o estado dela só
pelo repositório) bloqueia com 403 quem tem `papel === 'atendente'` nos
módulos Vault, Team, Voice, Dash/GOS e Flow. O front-end replica a mesma regra
em `auth-guard.js` (`PAGINAS_ATENDENTE = ['up-lead.html', 'up-base.html']`),
mas isso é só conveniência — a proteção real é o backend.

O Gabriel está cadastrado com `papel = 'atendente'` no banco real (único valor
disponível quando a conta dele foi criada). Do jeito que está, ele toma 403
nos módulos que deveria acessar como sócio/consultor.

**Decisão pendente do Rafael:** criar papel novo `'socio'` vs. promover pra
`'admin'`. Precisa ser resolvida — no banco de dados real, não só no
`seed-membros.sql`/`up-team.html` de demo — **antes da Fase 1 ir ao ar**, não
depois. Nenhuma sessão consegue confirmar isso via `git pull`, porque o dado
vive no banco, não no repositório — checar diretamente ou perguntar ao
Rafael/Gabriel.

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
| Rota de acesso ativa (subdomínio vs. domínio principal `/suite/`) | _(preencher)_ | _(data)_ | _(hPanel / FTP / outro)_ |
| `_para-bruto-secrets/*` copiado pra `bruto-secrets/API/` fora do `public_html` | _(preencher)_ | | |
| `migracao.sql` já rodado no banco de produção | _(preencher)_ | | |
| Collation `#1267` aplicada em `lead_pipeline`/`amostra_envio` no banco real | _(preencher)_ | | |
| Tabela `followup_anexos` existe no banco real | _(preencher)_ | | |
| Hash de senha gerado pra cada pessoa (Rafael/Gabriel/outros) | _(preencher)_ | | |
| Papel do Gabriel no banco real (`atendente` / `socio` / `admin`) | _(preencher)_ | | |
| Deploy automático do Git realmente publicando `interno/suite/` no servidor | _(preencher)_ | | |
| `ANTHROPIC_API_KEY` configurada no ambiente do servidor | _(preencher)_ | | |
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
