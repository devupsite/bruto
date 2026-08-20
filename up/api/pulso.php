<?php
/* Ponte pública — sem segredo nenhum. Pode ir pro GitHub. */
$candidatos = [
    dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-secrets/API/suite-pulso.php',
    dirname(dirname($_SERVER['DOCUMENT_ROOT'])) . '/bruto-secrets/API/suite-pulso.php',
];
foreach ($candidatos as $caminho) {
    if (is_file($caminho)) { require $caminho; return; }
}
http_response_code(500);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['erro' => 'Não encontrei o backend em bruto-secrets/API/suite-pulso.php.']);
