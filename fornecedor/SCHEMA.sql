-- ════════════════════════════════════════════════════════════════
-- Portal Faion — schema novo, banco u764636502_bruto_interno
-- (mesmo banco já usado pela OS e pelo Atendimento — só 2 tabelas
-- novas, não mexe em nenhuma tabela existente)
--
-- COMO RODAR: phpMyAdmin → selecione o banco u764636502_bruto_interno
-- → aba "SQL" → cola isso tudo → Executar.
-- ════════════════════════════════════════════════════════════════

-- Disponibilidade por produto (a Faion atualiza, a Bruto consulta)
CREATE TABLE disponibilidade_produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_slug VARCHAR(60) NOT NULL UNIQUE,
  status ENUM('disponivel','sob_encomenda','indisponivel') NOT NULL DEFAULT 'disponivel',
  dias_encomenda INT DEFAULT NULL, -- só relevante quando status = sob_encomenda
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  atualizado_por VARCHAR(60) DEFAULT NULL -- usuário que fez a última atualização
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Semeia as 17 linhas (uma por produto do catálogo), todas como
-- "disponível" por padrão — a Faion ajusta o que for diferente.
INSERT INTO disponibilidade_produtos (produto_slug, status) VALUES
('brick-eco-palha','disponivel'),
('brick-rusticatto-palha','disponivel'),
('brick-lumus','disponivel'),
('brick-mescla-prime','disponivel'),
('brick-natura','disponivel'),
('brick-rosso-prime','disponivel'),
('brick-rusticatto-fume','disponivel'),
('brick-rusticatto-rosso','disponivel'),
('brick-rusticatto-sertao','disponivel'),
('brick-rusticatto-terra-negra','disponivel'),
('brick-terra-cerrado','disponivel'),
('cimenticio-alpino','disponivel'),
('cimenticio-brisa','disponivel'),
('cimenticio-urban','disponivel'),
('rockface-alpino','disponivel'),
('rockface-brisa','disponivel'),
('rockface-urban','disponivel');

-- Sinal de demanda: 1 linha por vez que um produto é orçado no
-- precificador. Sem dado sensível (sem preço, sem margem, sem nome de
-- cliente) — só qual produto e quando, pra virar contagem agregada.
CREATE TABLE sinal_demanda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_slug VARCHAR(60) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_produto_data (produto_slug, criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
