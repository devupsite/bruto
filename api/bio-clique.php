<?php
/* ════════════════════════════════════════════════════════════════
   BIO — registro de cliques da página /bio/
   Não contém segredo nenhum: pode ir pro GitHub sem problema.

   Recebe um POST JSON { "id": "whatsapp" } e soma +1 no contador
   do dia. Os dados moram FORA do public_html, em bruto-dados/,
   pelo mesmo motivo do bruto-secrets/: ficam protegidos do deploy
   automático do Git (que substitui o conteúdo das pastas) e não
   são acessíveis pela web.

   Nenhum dado pessoal é gravado — só o id do link e a data.
════════════════════════════════════════════════════════════════ */

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'use POST']);
    exit;
}

$corpo = json_decode(file_get_contents('php://input'), true);
$id = $corpo['id'] ?? '';

// Whitelist de formato: letras minúsculas, números, hífen, underline (1–40 chars)
if (!is_string($id) || !preg_match('/^_?[a-z0-9][a-z0-9_-]{0,39}$/', $id)) {
    http_response_code(400);
    echo json_encode(['erro' => 'id inválido']);
    exit;
}

$pasta   = dirname($_SERVER['DOCUMENT_ROOT']) . '/bruto-dados';
$arquivo = $pasta . '/bio-cliques.json';

if (!is_dir($pasta) && !mkdir($pasta, 0750, true)) {
    http_response_code(500);
    echo json_encode(['erro' => 'não foi possível criar bruto-dados/']);
    exit;
}

$h = fopen($arquivo, 'c+');
if ($h === false) {
    http_response_code(500);
    echo json_encode(['erro' => 'não foi possível abrir o arquivo de dados']);
    exit;
}

// trava o arquivo pra dois cliques simultâneos não se perderem
if (flock($h, LOCK_EX)) {
    $bruto = stream_get_contents($h);
    $dados = json_decode($bruto ?: '{}', true);
    if (!is_array($dados)) $dados = [];

    $dados += ['dias' => [], 'totais' => []];

    $hoje = (new DateTime('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d');

    $dados['dias'][$hoje][$id] = ($dados['dias'][$hoje][$id] ?? 0) + 1;
    $dados['totais'][$id]      = ($dados['totais'][$id] ?? 0) + 1;
    $dados['atualizado_em']    = date('c');

    ftruncate($h, 0);
    rewind($h);
    fwrite($h, json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($h);
    flock($h, LOCK_UN);
}
fclose($h);

http_response_code(204);
