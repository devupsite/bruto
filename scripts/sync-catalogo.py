#!/usr/bin/env python3
"""
Sincroniza catalogo.json -> produto-*.html, texturas.html, ordem-servico.js

catalogo.json e a fonte unica de verdade para preco/dimensao/sku dos 19
produtos. Este script NAO roda em producao (site estatico, sem build) -
roda manualmente sempre que um dado do catalogo.json mudar, e regenera os
4 pontos de preco por produto + o CATALOGO de ordem-servico.js.

Uso:
    python3 scripts/sync-catalogo.py            # aplica as mudancas
    python3 scripts/sync-catalogo.py --check     # so mostra o que mudaria

Ver COLABORACAO.md item 32.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOGO_PATH = ROOT / "catalogo.json"

LINHA_LABEL = {"brick": "Brick", "cimenticio": "Cimentício", "rockface": "Rockface"}


def preco_str_ponto(preco):
    return f"{preco:.2f}"  # 153.90


def preco_str_virgula(preco):
    return preco_str_ponto(preco).replace(".", ",")  # 153,90


def dim_str(dims):
    a, b, c = dims
    return f"{a}mm x {b}mm x {c}mm"


def bucket_preco(preco):
    if preco <= 150:
        return "ate150"
    if preco <= 200:
        return "150a200"
    return "acima200"


def sync_produto_page(produto, check, changed):
    path = ROOT / f"produto-{produto['slug']}.html"
    if not path.exists():
        print(f"  [AVISO] pagina nao encontrada: {path.name}")
        return
    original = path.read_text(encoding="utf-8")
    text = original

    preco_v = preco_str_virgula(produto["preco"])
    preco_p = preco_str_ponto(produto["preco"])
    dim = dim_str(produto["dimensoes_mm"])

    # 1) preco visivel: class="price">R$ 153,90
    text = re.sub(
        r'(class="price">R\$ )[\d.,]+',
        lambda m: m.group(1) + preco_v,
        text,
        count=1,
    )
    # 2) JSON-LD: "price": "153.90"
    text = re.sub(
        r'("price":\s*")[\d.]+(")',
        lambda m: m.group(1) + preco_p + m.group(2),
        text,
        count=1,
    )
    # 3) data-product-price="153,90"
    text = re.sub(
        r'(data-product-price=")[\d.,]+(")',
        lambda m: m.group(1) + preco_v + m.group(2),
        text,
        count=1,
    )
    # 4) dimensao: <span>270mm x 70mm x 15mm</span> (primeiro span com "mm x" no product-specs)
    text = re.sub(
        r"(<span>)\d+mm x \d+mm x \d+mm(</span>)",
        lambda m: m.group(1) + dim + m.group(2),
        text,
        count=1,
    )
    # 5) peso: <span>350g</span> (só sincroniza se o produto tiver peso_g E a
    # página já tiver o spec-item de Peso — não cria o bloco do zero)
    if "peso_g" in produto:
        text = re.sub(
            r"(<span>)\d+g(</span>)",
            lambda m: m.group(1) + f"{produto['peso_g']}g" + m.group(2),
            text,
            count=1,
        )

    if text != original:
        changed.append(path.name)
        if not check:
            path.write_text(text, encoding="utf-8")


def sync_texturas(produtos, check, changed):
    path = ROOT / "texturas.html"
    original = path.read_text(encoding="utf-8")
    text = original

    for produto in produtos:
        preco_v = preco_str_virgula(produto["preco"])
        bucket = bucket_preco(produto["preco"])
        href = f'produto-{produto["slug"]}.html'

        # Acha o bloco <a href="produto-X.html" ... data-preco="...">  ... <p class="tex-card__price">R$ Y <span>
        pattern = re.compile(
            r'(<a href="' + re.escape(href) + r'"[^>]*data-preco=")[^"]*(")'
        )
        text = pattern.sub(lambda m: m.group(1) + bucket + m.group(2), text, count=1)

        # preco exibido no card - procura o proximo tex-card__price depois do href
        idx = text.find(f'href="{href}"')
        if idx != -1:
            end = text.find("</a>", idx)
            block = text[idx:end]
            new_block = re.sub(
                r'(class="tex-card__price">R\$ )[\d.,]+',
                lambda m: m.group(1) + preco_v,
                block,
                count=1,
            )
            text = text[:idx] + new_block + text[end:]

    if text != original:
        changed.append("texturas.html")
        if not check:
            path.write_text(text, encoding="utf-8")


def sync_ordem_servico(produtos, check, changed):
    path = ROOT / "ordens" / "ordem-servico.js"
    original = path.read_text(encoding="utf-8")

    linhas = []
    for p in produtos:
        linha = (
            "    { slug: \"%s\", categoria: \"%s\", nome: \"%s\", sku: \"%s\", preco: %s, dimensoes: \"%s\""
            % (
                p["slug"],
                LINHA_LABEL[p["linha"]],
                p["nome"],
                p["sku"],
                preco_str_ponto(p["preco"]),
                dim_str(p["dimensoes_mm"]),
            )
        )
        if "peso_g" in p:
            linha += ", peso: \"%dg\"" % p["peso_g"]
        linha += " }"
        linhas.append(linha)
    novo_bloco = "  var CATALOGO = [\n" + ",\n".join(linhas) + "\n  ];"

    text = re.sub(
        r"  var CATALOGO = \[.*?\];",
        lambda m: novo_bloco,
        original,
        count=1,
        flags=re.DOTALL,
    )

    if text != original:
        changed.append("ordem-servico.js")
        if not check:
            path.write_text(text, encoding="utf-8")


def main():
    check = "--check" in sys.argv
    catalogo = json.loads(CATALOGO_PATH.read_text(encoding="utf-8"))
    produtos = catalogo["produtos"]

    changed = []
    for p in produtos:
        sync_produto_page(p, check, changed)
    sync_texturas(produtos, check, changed)
    sync_ordem_servico(produtos, check, changed)

    if changed:
        modo = "seriam alterados" if check else "alterados"
        print(f"Arquivos {modo}: {', '.join(changed)}")
        print("Lembrete: bump manual de '?v=' em styles.css/JS compartilhado NAO e feito por este script.")
    else:
        print("Nenhuma mudanca necessaria - tudo ja sincronizado com catalogo.json.")


if __name__ == "__main__":
    main()
