# UP Co. Suite · Instância BRUTO — Arquitetura e Integração

> Documento de trabalho. Última atualização: 28/07/2026.
> Estado: adaptação de conteúdo e marca concluída. Backend real ainda não construído.

---

## 1. O que a suíte é (e o que ela não é) na Bruto

A Bruto já tem quatro ferramentas em produção: **Atendimento Técnico** (chat com IA
para atendentes), **Ordem de Serviço** (gera PDF de pedido), **Precificador**
(calculadora de orçamento) e o **Rodízio de WhatsApp**.

A suíte **não substitui nenhuma delas**. Ela entra como camada de visão executiva
por cima — responde "como está o negócio esta semana", não "como respondo este
cliente". Sempre que um módulo precisar de um dado que já existe numa ferramenta
de produção, ele **lê** desse lugar. Nunca duplica, nunca reescreve.

---

## 2. Escopo ativo — por que 10 módulos viraram 8

Uma operação de três pessoas não sustenta dez painéis. O escopo foi dividido em
`config.js` (`SUITE_LAYOUT`), e mudar de grupo é mover um id de lugar:

| Grupo | Módulos | Racional |
|---|---|---|
| **Operação** (uso diário) | UP·Dash, UP·Lead, UP·Flow, UP·Vault | Cobrem o ciclo inteiro: visão → funil → pedido → dinheiro |
| **Apoio** (consulta pontual) | UP·Base, UP·Voice, UP·GOS, UP·Team | Valiosos, mas ninguém abre todo dia |
| **Adiado** (fora da navegação) | UP·Core, UP·Mind | Continuam no código. UP·Core é BPM formal — a operação não tem escala pra isso ainda, e UP·Base cobre com SOPs. UP·Mind precisa de meses de histórico acumulado que ainda não existe |

Nomes dos módulos e a assinatura **by UP — Co.** permanecem em todos os casos.

---

## 3. Vocabulário do segmento (`BRUTO_OPS` em config.js)

A suíte original falava a língua de consultoria PME genérica (MRR, BANT, onboarding).
Isso foi trocado pelo vocabulário real de **venda por especificação de revestimento**.

### 3.1 Funil — por que "Amostra enviada" é etapa própria

```
Contato → Qualificado → Amostra enviada → Orçamento → Fechamento → Pedido ✓ / Perdido
```

Num CRM genérico, a amostra seria um detalhe dentro de "proposta". Aqui ela é etapa
própria porque **é o ponto de maior evasão do funil**: a peça física sai da mão da
Bruto e a decisão passa a acontecer longe, sem acompanhamento, muitas vezes dependendo
de um terceiro (o cliente final do arquiteto). Sem visibilidade dessa etapa, o lead
some silenciosamente.

### 3.2 Tipos de cliente

Espelham **exatamente** o enum `clienteTipo` já usado no Atendimento Técnico:
`arquiteto`, `construtor`, `revendedor`, `residencial`, `comercial`, `outro`.

Isso não é escolha estética — é requisito de integração. Qualquer categoria nova
inventada aqui quebraria o join com as sessões reais.

O tipo muda a leitura do funil: arquiteto e construtor têm ciclo longo e decisão em
duas camadas (o profissional especifica, o cliente final aprova); residencial decide
sozinho e fecha mais rápido, com ticket menor; revendedor sempre escala para condição
comercial fora do catálogo.

### 3.3 SLAs que viram alerta automático

| Regra | Valor | Origem |
|---|---|---|
| Lead sem resposta | 24h | Operacional |
| Orçamento parado | 48h | Operacional |
| Amostra sem follow-up | 7 dias | Operacional |
| Prazo pra confirmar data exata | 3 dias úteis | KB oficial |
| Entrega total | 7 a 15 dias úteis | KB oficial |

⚠️ **Os dois últimos são frequentemente confundidos.** 3 dias úteis é o prazo que a
equipe tem pra dar uma **data específica** ao cliente. 7 a 15 dias úteis é a **entrega
completa** — e esse número já inclui produção e frete somados, não são etapas
que se somam.

### 3.4 Cadência de follow-up

Cinco toques: D+1, D+3, D+7 (ligação), D+14, D+30.

Fundamento: venda por especificação morre de silêncio, não de objeção. Referência de
mercado indica que a conversão mais alta tende a acontecer a partir do sétimo contato, enquanto cerca de metade das empresas não faz sequer o primeiro follow-up e apenas uma minoria passa de três (fonte: Vobi, estratégia de vendas para arquitetura e construção). Quem mantém cadência
disputa com pouquíssima concorrência.

---

## 4. Integração com o banco real

Banco único: `u764636502_bruto_interno` (MySQL, Hostinger compartilhado).
**Não precisa de VPS** — a suíte é HTML/JS estático + PHP fino, igual às ferramentas
que já rodam nesse plano.

### 4.1 Padrão de segurança já existente — respeitar

O repositório usa **segurança por omissão**: todo arquivo em `api/` é uma ponte
pública de ~10 linhas que faz `require` do arquivo real em `bruto-secrets/`, uma
pasta irmã de `public_html`, fora do Git. Nenhum segredo ou SQL vive no repositório.

Qualquer endpoint novo da suíte **segue esse mesmo padrão**.

### 4.2 Ordem de Serviço — schema confirmado por leitura do código

Payload real enviado por `ordens/ordem-servico.js` → `api/salvar-ordem.php`:

```
cliente_nome, cliente_contato, itens (JSON), total_geral, observacoes
```

Campos devolvidos na listagem: `id`, `numero_os`, `criado_por`, `criado_em`,
`status`, `total_geral`, `itens`.

Enum de status: `pendente` · `em produção` · `concluído` · `cancelado`

✅ **UP·Flow encaixa sem alteração no schema.** Só lê.

### 4.3 Atendimento — schema é diferente do esperado

Não existe tabela de leads normalizada. O Atendimento salva **sessões de conversa**
via `api/historico.php` (ações: `salvar`, `listar`, `obter`, `excluir`), com os campos:

```
id (ex: 'sess_1721...'), clienteNome, clienteTipo, preview,
msgCount, criadoEm, payload (JSON com a conversa inteira)
```

Não há coluna de etapa de funil, valor estimado ou temperatura — nunca existiu nesse
contexto, porque a ferramenta foi feita para responder conversas, não para gerir pipeline.

**Consequência de arquitetura:** o UP·Lead **não deve** adicionar colunas na tabela de
sessões (código em produção, cliente ativo, risco desnecessário). Cria-se uma tabela
paralela ligada por `sessao_id`:

```sql
CREATE TABLE lead_pipeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sessao_id VARCHAR(40) NOT NULL,
  etapa ENUM('contato','qualificado','amostra','orcamento','fechamento','ganho','perdido')
        DEFAULT 'contato',
  valor_estimado DECIMAL(10,2) DEFAULT NULL,
  m2_estimados DECIMAL(8,2) DEFAULT NULL,
  linha VARCHAR(20) DEFAULT NULL,          -- brick | cimenticio | rockface
  ultima_interacao DATETIME DEFAULT NULL,  -- alimenta o "X dias sem contato"
  proximo_toque TINYINT DEFAULT 1,         -- posição na cadência de follow-up
  responsavel VARCHAR(60) DEFAULT NULL,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sessao (sessao_id),
  INDEX idx_etapa (etapa)
);
```

E a tabela de amostras — separada porque um lead pode receber vários modelos,
e é justamente o cruzamento modelo × desfecho que revela o que drena custo:

```sql
CREATE TABLE amostra_envio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sessao_id VARCHAR(40) NOT NULL,
  modelo VARCHAR(60) NOT NULL,        -- 'Rusticatto Fumê', 'Rockface Urban'…
  linha VARCHAR(20) NOT NULL,         -- brick | cimenticio | rockface
  enviado_em DATE NOT NULL,
  custo_peca DECIMAL(8,2) DEFAULT NULL,
  frete_cobrado DECIMAL(8,2) DEFAULT NULL,  -- pago pelo cliente
  desfecho ENUM('pendente','virou_pedido','perdido','sem_retorno')
           DEFAULT 'pendente',
  desfecho_em DATE DEFAULT NULL,
  INDEX idx_modelo (modelo),
  INDEX idx_desfecho (desfecho),
  INDEX idx_sessao (sessao_id)
);
```

Com isso, a pergunta "quais modelos consomem amostra e nunca fecham" vira uma
consulta, em vez de uma intuição.

O UP·Lead faz join: nome, tipo e data vêm das sessões existentes; etapa, valor,
metragem e cadência vêm da tabela nova. Zero linhas tocadas em produção.

### 4.4 Tabelas novas necessárias (sem equivalente hoje)

`transacoes` (Vault) · `base_docs` (Base) · `membros` (Team) ·
`voice_alertas` (Voice) · `pulse_semanal` (Dash/GOS)

---

## 5. Bloqueio antes de qualquer dado real

🔴 **A suíte não tem autenticação nenhuma hoje.**

Ela vai expor financeiro consolidado e pipeline comercial. É exatamente o tipo de
exposição que já aconteceu uma vez na Ordem de Serviço (aberta, sem senha, indexável
pelo Google) e precisou ser corrigida.

**Mínimo aceitável antes de ligar dado real:** HTTP Basic Auth na pasta do subdomínio.
**Recomendado:** login por usuário, já que pessoas diferentes acessam — e a tabela
`usuarios` já existe no banco, com papel admin/atendente implementado no Atendimento.

---

## 6. Deploy

- **Subdomínio sugerido:** `up.brutoceramica.com.br`
- **Padrão:** pasta isolada, nunca `public_html` da raiz
- **Sem VPS** — mesmo plano Hostinger compartilhado já suporta

---

## 7. Correções de fato aplicadas

Conteúdo gerado inicialmente por IA foi conferido contra a KB real do Atendimento
e corrigido:

| Antes (errado) | Depois (correto) |
|---|---|
| Brick com 12 modelos | **11 modelos** |
| "10 dias de produção + frete" | **7 a 15 dias úteis no total**, já somados |
| "Até 3 amostras grátis" | Até 3 amostras, mas **o frete não é grátis** |
| "Entrega para todo o Brasil" | **Entrega própria só na Grande SP**; fora, caso a caso |

Princípio: nenhum número de produto, prazo ou política entra na suíte sem conferência
contra a KB.

---

## 8. Próximos passos

1. Definir autenticação (bloqueio duro)
2. Criar `lead_pipeline` e as tabelas novas
3. Escrever endpoints PHP no padrão ponte + `bruto-secrets/`
4. Trocar `DEMO_MODE` para `false` módulo a módulo, começando por UP·Dash
5. Confirmar nomes reais da equipe (os atuais em UP·Team são placeholders)

---

## 9. Autenticação — implementada (28/07/2026)

O bloqueio da seção 5 foi resolvido. A suíte agora tem três camadas.

### Camada 1 — Servidor (a que importa)

`bruto-secrets/API/suite-auth.php` valida usuário e senha contra a tabela
`usuarios` que já existe (a mesma do Atendimento). Inclui:

- **bcrypt** (`password_verify`) — senha nunca em texto puro
- **Cookie de sessão endurecido** — `HttpOnly`, `Secure`, `SameSite=Strict`
- **`session_regenerate_id`** no login — impede fixação de sessão
- **Freio de força bruta** — atraso progressivo a partir da 3ª falha,
  bloqueio de 15 min na 8ª (tabela `suite_login_tentativas`)
- **Mensagem de erro genérica** e verificação em tempo constante — não
  revela se o usuário existe (evita enumeração de contas)
- **Expiração** — 8h de inatividade, 12h de idade máxima
- **Checagem de User-Agent** — cookie usado em outro navegador derruba a sessão

### Camada 2 — Servidor web (`.htaccess`)

HTTPS obrigatório, `noindex` via cabeçalho, sem listagem de diretório,
bloqueio de `.md`/`.sql`/`.log`/arquivos ocultos, `X-Frame-Options: DENY`.

Traz também, comentado, o bloco de **Basic Auth de pasta** — a proteção de
5 minutos para usar hoje, antes mesmo do login PHP estar no ar.

### Camada 3 — Navegador (`auth-guard.js`)

Cobre a tela até confirmar a identidade e redireciona para `login.html`.
É conveniência, **não** segurança: um guarda de front-end é contornável
desligando o JavaScript. Por isso **todo endpoint de dados novo precisa
chamar `suite_exige_sessao()` como primeira linha** — sem exceção.

### Ordem de instalação

1. Rodar o SQL do rodapé de `suite-auth.php` (tabela de tentativas +
   conferir se `usuarios` tem `senha_hash`)
2. Gerar o hash de cada pessoa **no servidor**:
   `php -r "echo password_hash('senha', PASSWORD_BCRYPT, ['cost'=>12]);"`
3. Copiar os 4 arquivos de `_para-bruto-secrets/` para `bruto-secrets/API/`
4. Subir a pasta pública (com `api/`, `.htaccess`, `login.html`)
5. Testar: abrir `up-dash.html` direto deve jogar para o login

⚠️ **Nenhuma senha, hash ou credencial aparece nos arquivos que vão pro Git.**
Os arquivos em `api/` são pontes de ~10 linhas, iguais às que já existem.

---

## 10. Chamadas de IA — proxy no servidor (29/07/2026)

### O problema encontrado

A suíte original chamava `api.anthropic.com` **direto do navegador**. Isso funciona
dentro do sandbox de artifacts do Claude.ai, onde a chave é injetada automaticamente.
Num site real, só há dois desfechos: falha por falta de chave, ou alguém cola a chave
no JavaScript — e aí ela fica legível por qualquer visitante que abra o inspetor.

### A correção

`window.callClaude` agora chama `api/ia.php`, ponte para
`bruto-secrets/API/suite-ia.php` — mesmo padrão do `api/chat.php` do Atendimento.
A chave nunca sai do servidor.

O proxy protege quatro coisas:

| Proteção | Como |
|---|---|
| **Chave da API** | Vive em `bruto-secrets/`, fora do Git e fora do navegador |
| **Uso não autorizado** | `suite_exige_sessao()` na primeira linha — sem login, nenhum token é gasto |
| **Custo descontrolado** | Teto de 120 chamadas por pessoa/dia (tabela `suite_ia_uso`); tetos de `max_tokens` e tamanho de payload |
| **Vazamento em erro** | Erro cru da API vai para o log do servidor; o navegador recebe mensagem genérica |

O contexto da BRUTO (linhas, tom de voz, regra de nunca prometer preço/prazo) é
injetado **no servidor**, não enviado pelo navegador. O front-end manda dados; as
instruções são montadas de um lado que o usuário não controla.

### Degradação suave

Se a IA estiver fora do ar, o painel **não quebra** — continua exibindo os dados e só
deixa de mostrar a leitura gerada, com um aviso. Análise indisponível não pode
derrubar o financeiro da tela.

### Isso muda a necessidade de VPS?

**Não.** O proxy é PHP com cURL — presente em qualquer plano compartilhado, e o
Atendimento já faz exatamente isso hoje, no mesmo servidor, com volume maior
(uma chamada por mensagem de conversa). A suíte chama IA muito menos: algumas
análises por painel, sob demanda.

`server.js` e `package.json` são apenas para desenvolvimento local (`npm start`) —
**não sobem para o servidor**.

---

## 11. Amostras — tratamento unificado (29/07/2026)

Amostra é o ponto mais delicado da operação: é onde o material sai da mão da BRUTO,
é onde o lead mais esfria, e é custo real que não estava sendo medido. O tratamento
estava inconsistente entre módulos e foi unificado.

### Contradições corrigidas

| Onde | Estava | Correto |
|---|---|---|
| UP·Vault | Despesa "Frete de amostras **grátis**" | "Amostras — peças enviadas", categoria própria `Amostras`. O frete é pago pelo cliente; o custo da BRUTO é a **peça** |
| UP·Base (SOP qualificação) | Não mencionava frete de amostra | Regra explícita: nunca dizer "amostra grátis" |
| UP·Dash | Dois campos distintos com o mesmo rótulo "Amostras enviadas" | "Amostras **solicitadas**" (comercial) × "Amostras **despachadas**" (operacional) |
| UP·Dash / UP·Lead | Modelo **"Vulcano"** citado como Brick | Nome inventado — não existe nos 11 modelos. Trocado por Rusticatto Terra Negra |

### A regra, em um lugar só

`BRUTO_OPS.amostra` no `config.js` passa a ser a fonte única: máximo de 3 por pedido,
`frete_gratis: false`, custo médio da peça, prazo de follow-up de 7 dias.
Qualquer módulo que fale de amostra lê daqui.

### Rastreio por modelo — o que faltava

Registrar "3 amostras enviadas" não responde nada. Registrar **quais modelos** e
**qual foi o desfecho** responde a pergunta que vale dinheiro: *quais dos 17 SKUs
consomem amostra e nunca viram pedido?*

São 17 modelos e cada amostra despachada é peça real com custo. Um modelo que drena
amostra sem converter não aparece numa semana — só somando meses. Por isso a tabela
`amostra_envio` guarda modelo, custo, frete cobrado e desfecho.

**É também a primeira coisa concreta que dá função ao UP·Mind**, quando ele entrar:
sem esse registro, ele não teria o que analisar além de ruído semanal.

### Novo SOP

`UP·Base → SOP — Controle de Amostras`: registrar modelos (não só quantidade),
confirmar frete antes do envio, lançar custo na categoria própria, marcar a etapa no
funil (o que dispara o D+7) e registrar o desfecho ao fechar ou perder.
