<?php
/* ════════════════════════════════════════════════════════════════
   Ponte pública — NÃO contém segredo nenhum.
   O arquivo de verdade (com a lógica e a conexão ao banco) mora
   fora do public_html, em bruto-secrets/, protegido do deploy
   automático do Git.
   Este arquivo pode ir pro GitHub sem problema.
════════════════════════════════════════════════════════════════ */
require dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-secrets/API/salvar-cenario.php';
