<?php
/* ════════════════════════════════════════════════════════════════
   Ponte pública — NÃO contém segredo nenhum.
   O arquivo de verdade mora fora do public_html, em bruto-secrets/,
   protegido do deploy automático do Git.
   NOTA: dirname() duas vezes porque a raiz deste subdomínio já é
   .../public_html/atendimento — precisa subir 2 níveis pra chegar em
   .../domains/brutoceramica.com.br/bruto-secrets/ (diferente do padrão
   de interno/, que está direto na raiz do site principal).
   Este arquivo pode ir pro GitHub sem problema.
════════════════════════════════════════════════════════════════ */
require dirname(dirname($_SERVER['DOCUMENT_ROOT'])) . '/bruto-secrets/API/me.php';
