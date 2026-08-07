<?php
/* ════════════════════════════════════════════════════════════════
   Ponte pública — NÃO contém segredo nenhum.
   Protegida pelo .htaccess da pasta /fornecedor/ (Basic Auth próprio,
   separado de /atendimento e /interno). A lógica de verdade mora fora
   do public_html, em bruto-secrets/, protegido do deploy automático
   do Git. Este arquivo pode ir pro GitHub sem problema.
════════════════════════════════════════════════════════════════ */
require dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-secrets/API/disponibilidade-fornecedor.php';
