<?php
/* ════════════════════════════════════════════════════════════════
   Ponte pública — NÃO contém segredo nenhum.
   O arquivo de verdade (com a chave da API da Anthropic) mora
   fora do public_html, em bruto-secrets/, protegido do deploy
   automático do Git.

   Funciona tanto acessado pelo subdomínio (up.brutoceramica.com.br)
   quanto pelo domínio principal (brutoceramica.com.br/suite/) —
   tenta os dois caminhos possíveis em vez de assumir um só.

   Este arquivo pode ir pro GitHub sem problema.
════════════════════════════════════════════════════════════════ */

$candidatos = [
    dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-secrets/API/suite-ia.php',
    dirname(dirname($_SERVER['DOCUMENT_ROOT'])) . '/bruto-secrets/API/suite-ia.php',
];

foreach ($candidatos as $caminho) {
    if (is_file($caminho)) {
        require $caminho;
        return;
    }
}

http_response_code(500);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['erro' => 'Não encontrei o backend em bruto-secrets/API/suite-ia.php — confira se o arquivo existe e se a pasta do subdomínio está correta.']);
