<?php
/* ════════════════════════════════════════════════════════════════
   Ponte pública — NÃO contém segredo nenhum.
   O número real do fornecedor mora fora do public_html, em
   bruto-secrets/, protegido do deploy automático do Git.
   Este arquivo pode ir pro GitHub sem problema.
════════════════════════════════════════════════════════════════ */
require dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-secrets/whatsapp-fornecedor.php';
