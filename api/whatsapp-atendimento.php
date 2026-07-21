<?php
/* ════════════════════════════════════════════════════════════════
   Ponte pública — NÃO contém segredo nenhum.
   Os 3 números reais dos atendentes moram fora do public_html, em
   bruto-secrets/, protegido do deploy automático do Git.
   Este arquivo pode ir pro GitHub sem problema.
════════════════════════════════════════════════════════════════ */
require dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-secrets/API/whatsapp-atendimento.php';
