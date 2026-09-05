<?php
/* ════════════════════════════════════════════════════════════════
   Ponte pública — NÃO contém segredo nenhum.
   O arquivo de verdade (com a chamada à API da Anthropic) mora
   fora do public_html, em bruto-secrets/API/, protegido do deploy
   automático do Git.
   Este arquivo pode ir pro GitHub sem problema.

   Usado pelo projeto "Leitor de Planta" (repo devupsite/leitor-planta-bruto-),
   hospedado no GitHub Pages — este endpoint existe só pra fazer a chamada
   à API da Anthropic sem expor a chave no front-end estático.
════════════════════════════════════════════════════════════════ */
require dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-secrets/API/planta-vision.php';
