-- ════════════════════════════════════════════════════════════════
-- UP Co. Suite · BRUTO — Migração SQL consolidada
-- Banco: u764636502_bruto_interno
-- Rodar uma vez, via phpMyAdmin ou linha de comando.
-- Nenhum comando aqui toca tabela existente (usuarios, ordens_servico,
-- sessões do Atendimento) — só cria tabelas novas, todas com prefixo
-- claro pra não colidir com nada que já existe.
-- ════════════════════════════════════════════════════════════════

-- ── 1. Autenticação da suíte ──────────────────────────────────────
-- Freio de força bruta no login. Ver _para-bruto-secrets/suite-auth.php
CREATE TABLE IF NOT EXISTS suite_login_tentativas (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(60) NOT NULL,
  ip      VARCHAR(45) NOT NULL,
  sucesso TINYINT(1)  NOT NULL DEFAULT 0,
  quando  DATETIME    NOT NULL,
  INDEX idx_busca (usuario, ip, quando)
);

-- Conferir se a tabela `usuarios` (já existente, do Atendimento) tem
-- coluna de hash de senha. Se o Atendimento usa só Basic Auth de pasta,
-- provavelmente não tem — rodar isso ANTES de tentar logar na suíte:
--
--   DESCRIBE usuarios;
--
-- Se faltar senha_hash, descomentar e rodar:
-- ALTER TABLE usuarios ADD COLUMN senha_hash VARCHAR(255) NULL AFTER usuario;

-- ── 2. Proxy de IA ─────────────────────────────────────────────────
-- Teto de uso diário. Ver _para-bruto-secrets/suite-ia.php
CREATE TABLE IF NOT EXISTS suite_ia_uso (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(60) NOT NULL,
  quando  DATETIME    NOT NULL,
  status  SMALLINT    NOT NULL DEFAULT 0,
  INDEX idx_uso (usuario, quando)
);

-- ── 3. UP·Lead — pipeline sobre o Atendimento ──────────────────────
-- NÃO toca a tabela de sessões do Atendimento. Liga por sessao_id.
--
-- ⚠️ sessao_id usa COLLATE utf8mb4_uca1400_ai_ci de propósito — tem que
-- bater exatamente com a collation de `sessoes_atendimento.id` (tabela do
-- Atendimento, já existente). Isso já causou erro real em produção
-- ("#1267 Combinação ilegal de collations" em qualquer JOIN) quando a
-- coluna nasceu com a collation padrão do CREATE TABLE em vez desta —
-- corrigido então via ALTER TABLE direto no banco, e agora corrigido aqui
-- também para quem rodar esta migração do zero não bater na mesma parede.
-- Antes de reusar este padrão em tabela nova, sempre conferir
-- `SHOW FULL COLUMNS FROM sessoes_atendimento` primeiro.
CREATE TABLE IF NOT EXISTS lead_pipeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sessao_id VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  etapa ENUM('contato','qualificado','amostra','orcamento','fechamento','ganho','perdido')
        DEFAULT 'contato',
  valor_estimado DECIMAL(10,2) DEFAULT NULL,
  m2_estimados DECIMAL(8,2) DEFAULT NULL,
  linha VARCHAR(20) DEFAULT NULL,          -- brick | cimenticio | rockface
  ultima_interacao DATETIME DEFAULT NULL,
  proximo_toque TINYINT DEFAULT 1,
  responsavel VARCHAR(60) DEFAULT NULL,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sessao (sessao_id),
  INDEX idx_etapa (etapa)
);

-- Rastreio de amostra por modelo — a pergunta que vale dinheiro
-- ("quais dos 17 SKUs consomem amostra e nunca fecham") só existe
-- se isso for registrado peça a peça.
CREATE TABLE IF NOT EXISTS amostra_envio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sessao_id VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  modelo VARCHAR(60) NOT NULL,
  linha VARCHAR(20) NOT NULL,
  enviado_em DATE NOT NULL,
  custo_peca DECIMAL(8,2) DEFAULT NULL,
  frete_cobrado DECIMAL(8,2) DEFAULT NULL,
  desfecho ENUM('pendente','virou_pedido','perdido','sem_retorno') DEFAULT 'pendente',
  desfecho_em DATE DEFAULT NULL,
  INDEX idx_modelo (modelo),
  INDEX idx_desfecho (desfecho),
  INDEX idx_sessao (sessao_id)
);

-- Anexo de follow-up real (conversa de WhatsApp colada ou exportada em .txt)
-- usado pelo botão "✨ Sugerir abordagem" do UP·Lead. Criada numa sessão
-- anterior direto no banco (nunca chegou a entrar neste arquivo consolidado)
-- — mesma collation de sessao_id, pelo mesmo motivo das duas tabelas acima.
CREATE TABLE IF NOT EXISTS followup_anexos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sessao_id VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  texto TEXT NOT NULL,
  criado_por VARCHAR(60) DEFAULT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessao (sessao_id)
);

-- ── 4. UP·Vault — financeiro ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('receita','despesa') NOT NULL,
  descricao VARCHAR(160) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  categoria VARCHAR(40) NOT NULL,
  vencimento_7d TINYINT(1) DEFAULT 0,
  ordem_servico_id VARCHAR(40) DEFAULT NULL,  -- liga com a OS quando a receita vem de um pedido
  criado_por VARCHAR(60) DEFAULT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_data (data),
  INDEX idx_tipo (tipo)
);

-- ── 5. UP·Base — documentação ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS base_docs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  categoria VARCHAR(40) NOT NULL,
  responsavel VARCHAR(60) DEFAULT NULL,
  steps JSON NOT NULL,
  nota TEXT DEFAULT NULL,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── 6. UP·Team — pessoas ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT DEFAULT NULL,       -- FK lógica pra `usuarios`, se quiser ligar 1:1
  nome VARCHAR(80) NOT NULL,
  cargo VARCHAR(80) NOT NULL,
  ativo TINYINT(1) DEFAULT 1,
  tarefas_concluidas INT DEFAULT 0,
  tarefas_abertas INT DEFAULT 0,
  atrasos INT DEFAULT 0,
  ausencias INT DEFAULT 0
);

-- ── 7. UP·Voice — alertas ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS voice_alertas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  urgencia ENUM('baixa','media','alta') DEFAULT 'media',
  fonte VARCHAR(30) DEFAULT NULL,     -- 'UP·Lead', 'UP·GOS', etc.
  contexto TEXT DEFAULT NULL,
  mensagem_whatsapp TEXT DEFAULT NULL,
  destinatarios VARCHAR(80) DEFAULT NULL,  -- 'founder,rafael'
  status ENUM('pendente','aprovado','enviado','descartado') DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 8. UP·Dash / UP·GOS — snapshot semanal ───────────────────────────
-- Guarda o pulso já calculado, em vez de recalcular tudo a cada carga
-- de página. Alimentado pelo cron semanal (seção 8 da ARQUITETURA-BRUTO.md).
CREATE TABLE IF NOT EXISTS pulse_semanal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semana VARCHAR(8) NOT NULL,        -- '2026-W31'
  health_score TINYINT DEFAULT NULL,
  dados JSON NOT NULL,               -- financeiro/comercial/operacional/equipe, já calculados
  insights JSON DEFAULT NULL,
  gerado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_semana (semana)
);

-- ════════════════════════════════════════════════════════════════
-- Fim. Depois de rodar, confira com:
--   SHOW TABLES LIKE '%suite%'; SHOW TABLES LIKE '%pipeline%';
--   SHOW TABLES LIKE 'amostra%'; SHOW TABLES LIKE 'transacoes';
--   SHOW TABLES LIKE 'base_docs'; SHOW TABLES LIKE 'membros';
--   SHOW TABLES LIKE 'voice_alertas'; SHOW TABLES LIKE 'pulse_semanal';
--   SHOW TABLES LIKE 'followup_anexos';
-- ════════════════════════════════════════════════════════════════
