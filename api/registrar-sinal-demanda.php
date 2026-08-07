<?php
/* ════════════════════════════════════════════════════════════════
   Ponte pública — NÃO contém segredo nenhum.
   Recebe o sinal de demanda do precificador (só qual produto e
   quando, sem preço/margem/cliente) e repassa pra lógica real.

   Fica FORA da proteção Basic Auth de /fornecedor/ de propósito —
   /interno/ e /fornecedor/ têm senhas diferentes (usuários diferentes:
   equipe Bruto vs. Faion), então uma chamada de dentro do precificador
   (autenticado como /interno/) não teria como também autenticar contra
   /fornecedor/ na mesma requisição. Esse endpoint só ESCREVE uma
   contagem agregada (nenhum dado sensível), risco baixo o suficiente
   pra ficar público — mesmo raciocínio do registrar-lead.php.
════════════════════════════════════════════════════════════════ */
require dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-secrets/API/registrar-sinal-demanda.php';
