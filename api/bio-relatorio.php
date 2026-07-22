<?php
/* ════════════════════════════════════════════════════════════════
   BIO — leitura do relatório de cliques
   Não contém segredo nenhum: pode ir pro GitHub sem problema.

   A chave de acesso mora fora do public_html, em:
     bruto-secrets/API/bio-config.php
   que deve definir:
     define('BIO_RELATORIO_CHAVE', 'sua-chave-aqui');

   Uso: GET /api/bio-relatorio.php?chave=SUA-CHAVE
   Resposta: o JSON de bruto-dados/bio-cliques.json
════════════════════════════════════════════════════════════════ */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

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

$chave = (string)($_GET['chave'] ?? '');
if ($chave === '' || !hash_equals(BIO_RELATORIO_CHAVE, $chave)) {
    http_response_code(401);
    echo json_encode(['erro' => 'chave inválida']);
    exit;
}

$arquivo = dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-dados/bio-cliques.json';
if (!is_file($arquivo)) {
    // ainda sem cliques registrados — devolve estrutura vazia válida
    echo json_encode(['dias' => new stdClass(), 'totais' => new stdClass(), 'atualizado_em' => null]);
    exit;
}

readfile($arquivo);
