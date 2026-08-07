<?php
/* ════════════════════════════════════════════════════════════════
   Ponte pública — NÃO contém segredo nenhum.
   Leitura pública e somente-leitura da disponibilidade de produto —
   mesmo motivo do registrar-sinal-demanda.php: a ferramenta de
   Atendimento vive em /atendimento (senha própria) e não consegue
   autenticar contra /fornecedor (senha diferente) na mesma
   requisição. Como é só LEITURA de um dado que não é sensível
   (disponibilidade de produto, sem preço/margem/cliente), o risco de
   deixar público é baixo — mesmo raciocínio já usado antes.
════════════════════════════════════════════════════════════════ */
require dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-secrets/API/consultar-disponibilidade.php';
