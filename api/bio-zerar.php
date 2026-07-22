<?php
/* ════════════════════════════════════════════════════════════════
   BIO — zerar o contador de cliques
   Não contém segredo nenhum: pode ir pro GitHub sem problema.

   Usa a MESMA chave do relatório (bruto-secrets/API/bio-config.php).
   Uso: POST /api/bio-zerar.php  body: {"chave":"SUA-CHAVE"}

   Faz backup do estado atual antes de zerar, em
   bruto-dados/bio-cliques.antes-de-zerar-AAAA-MM-DD-HHMMSS.json,
   caso precise recuperar algum número por engano.
════════════════════════════════════════════════════════════════ */

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'use POST']);
    exit;
}

$config = dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-secrets/API/bio-config.php';
if (!is_file($config)) {
    http_response_code(500);
    echo json_encode(['erro' => 'Falta o arquivo bruto-secrets/API/bio-config.php com a chave do relatório.']);
    exit;
}
require $config;

if (!defined('BIO_RELATORIO_CHAVE')) {
    http_response_code(500);
    echo json_encode(['erro' => 'bio-config.php existe mas não define BIO_RELATORIO_CHAVE.']);
    exit;
}

$corpo  = json_decode(file_get_contents('php://input'), true);
$chave  = (string)($corpo['chave'] ?? '');

if ($chave === '' || !hash_equals(BIO_RELATORIO_CHAVE, $chave)) {
    http_response_code(401);
    echo json_encode(['erro' => 'chave inválida']);
    exit;
}

$pasta   = dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-dados';
$arquivo = $pasta . '/bio-cliques.json';

if (is_file($arquivo)) {
    $carimbo = (new DateTime('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d-His');
    @copy($arquivo, $pasta . '/bio-cliques.antes-de-zerar-' . $carimbo . '.json');
}

$vazio = json_encode(['dias' => new stdClass(), 'totais' => new stdClass(), 'atualizado_em' => null], JSON_PRETTY_PRINT);
if (!is_dir($pasta)) mkdir($pasta, 0750, true);
file_put_contents($arquivo, $vazio, LOCK_EX);

echo json_encode(['ok' => true]);
