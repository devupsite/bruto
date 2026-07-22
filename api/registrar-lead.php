<?php
/* ════════════════════════════════════════════════════════════════
   Ponte pública — NÃO contém segredo nenhum.
   Recebe o beacon de clique (código de referência + gclid + atendente)
   disparado por whatsapp-atendimento.js e repassa pra lógica real,
   que mora fora do public_html, em bruto-secrets/, protegido do
   deploy automático do Git. Este arquivo pode ir pro GitHub sem
   problema.
════════════════════════════════════════════════════════════════ */
require dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-secrets/API/registrar-lead.php';
