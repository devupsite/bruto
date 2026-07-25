<?php
/* ════════════════════════════════════════════════════════════════
   Ponte pública — NÃO contém segredo nenhum.
   Recebe os dados de formulário (guia em PDF, sacola de amostras)
   disparados por lead-pdf.js e amostras.js, e repassa pra lógica
   real, que mora fora do public_html, em bruto-secrets/, protegido
   do deploy automático do Git. Este arquivo pode ir pro GitHub sem
   problema.

   Substitui o Formspree (25/07/2026) — mesma função (form → e-mail),
   agora rodando no próprio servidor via PHPMailer.
════════════════════════════════════════════════════════════════ */
require dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-secrets/API/enviar-lead.php';
