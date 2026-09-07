#!/usr/bin/env python3
"""
Gerador das paginas de produto do site da Bruto.

COMO USAR (o fluxo pensado pra mudar preco/nome sem precisar editar
17 arquivos HTML na mao):

  1. Abra _gerador/produtos.json
  2. Ache o produto pelo "slug_pagina" e mude o campo que precisar
     (preco, preco_json, nome, descricao, dimensoes, peso, etc.)
  3. Rode este script: python3 _gerador/gerar.py
  4. As paginas produto-*.html na raiz do site sao reescritas.
  5. Confira o "git diff" antes de commitar - se voce so mudou um
     preco, o diff deve mostrar SO esse preco mudando (em toda linha
     do site que citava aquele produto: pagina propria, relacionados,
     cross-sell, quiz, texturas.html - tudo de uma vez).

IMPORTANTE:
  - Os arquivos de IMAGEM (fotos) NAO sao gerenciados por este script
    e usam o nome ANTIGO do produto (decisao consciente de 02/09/2026,
    pra nao precisar renomear centenas de arquivos de imagem toda vez
    que o nome comercial mudar). O campo correto pra isso e derivado
    automaticamente a partir do primeiro item de "galeria" de cada
    produto - nao precisa mexer nisso manualmente.
  - Este script SO gera as paginas de produto (produto-*.html). Ele
    NAO atualiza texturas.html, quiz.html, sitemap.xml, catalogo.json
    nem as ferramentas internas (interno/, atendimento/, fornecedor/,
    ordens/) - esses ainda precisam de edicao separada quando o nome
    ou preco de um produto mudar. Unificar tudo numa fonte de dados so
    e o proximo passo natural deste sistema, ainda nao feito.
  - Ha 3 templates (um por linha: Brick, Cimenticio, Rockface) porque
    a estrutura HTML das 3 linhas NAO e identica entre si (meta tags,
    presenca de uma secao extra "cross-sell" em Cimenticio/Rockface
    que Brick nao tem, etc.) - descoberto ao construir isso em
    03/09/2026. Adicionar um produto de uma linha existente NAO exige
    mexer no template, so no produtos.json. Adicionar uma linha NOVA
    (uma 4a categoria) exigiria criar um 4o template.

Requer: pip install jinja2 (ja deve estar disponivel no ambiente)
"""
import json
import os
from jinja2 import Environment, FileSystemLoader

PASTA_GERADOR = os.path.dirname(os.path.abspath(__file__))
PASTA_SITE = os.path.dirname(PASTA_GERADOR)  # raiz do repositorio

# Ordem de exibicao na sidebar de cada categoria - e a ordem "de
# catalogo" que ja existia no site, nao e alfabetica nem por SKU.
# Preservada aqui pra nao embaralhar a sidebar ao gerar.
ORDEM_BRICK = ['brick-zulko-claro', 'brick-nardek-rosado', 'brick-vaskir-fundo',
               'brick-yandel-ambar', 'brick-kelvar-aceso', 'brick-zendral-cobre',
               'brick-thavrin-cinza', 'brick-ostrek-claro', 'brick-vanrik-terroso',
               'brick-kharun-funda', 'brick-ulvren-negro']
ORDEM_CIMENTICIO = ['cimenticio-naevel-claro', 'cimenticio-sorvel-leve', 'cimenticio-thurgo-denso']
ORDEM_ROCKFACE = ['rockface-yavrin-ameno', 'rockface-kelthar-branco', 'rockface-rundak-bruto']


def gerar():
    produtos = json.load(open(os.path.join(PASTA_GERADOR, 'produtos.json'), encoding='utf-8'))

    for p in produtos:
        primeira_foto = p['galeria'][0]
        # remove o sufixo -mao-N / -frontal-N (ou nada, se for a
        # primeira foto sem numero) pra achar o "slug de imagem" base
        import re
        m = re.match(r'^(.*?)-(mao|frontal)(-\d+)?\.webp$', primeira_foto)
        p['slug_imagem'] = m.group(1) if m else primeira_foto.replace('.webp', '')
        p['linha_curta'] = p['categoria'].replace('Revestimento ', '')
        p['galeria_sem_ext'] = [g.replace('.webp', '') for g in p['galeria']]

    produtos_por_slug = {p['slug_pagina']: p for p in produtos}
    todas_categorias = [
        {'nome': 'Brick', 'produtos': [produtos_por_slug[s] for s in ORDEM_BRICK]},
        {'nome': 'Cimentício', 'produtos': [produtos_por_slug[s] for s in ORDEM_CIMENTICIO]},
        {'nome': 'Rockface', 'produtos': [produtos_por_slug[s] for s in ORDEM_ROCKFACE]},
    ]

    env = Environment(
        loader=FileSystemLoader(os.path.join(PASTA_GERADOR, 'templates')),
        autoescape=False,
        keep_trailing_newline=True,
    )
    templates_por_linha = {
        'Brick': env.get_template('brick.html'),
        'Cimentício': env.get_template('cimenticio.html'),
        'Rockface': env.get_template('rockface.html'),
    }

    for p in produtos:
        template = templates_por_linha[p['linha_curta']]
        contexto = dict(p)
        contexto['galeria'] = p['galeria_sem_ext']
        contexto['todas_categorias'] = todas_categorias
        contexto['categoria_atual'] = p['linha_curta']
        contexto['categoria_jsonld'] = p['categoria']
        contexto['outros_da_linha'] = [produtos_por_slug[slug] for slug in p.get('cross_sell_ordem', [])]
        # combina_com guarda só o slug de cada produto (não uma cópia
        # de nome/preço) - resolvido aqui, pro produto REAL e atual,
        # pra nunca mostrar um preço desatualizado se ele mudar depois.
        contexto['combina_com'] = [
            {
                'slug_pagina': produtos_por_slug[slug]['slug_pagina'],
                'slug_imagem': produtos_por_slug[slug]['slug_imagem'],
                'categoria': produtos_por_slug[slug]['linha_curta'],
                'preco': produtos_por_slug[slug]['preco'],
                'nome': produtos_por_slug[slug]['nome'],
            }
            for slug in p['combina_com']
        ]

        html_gerado = template.render(**contexto)
        caminho_saida = os.path.join(PASTA_SITE, f"produto-{p['slug_pagina']}.html")
        open(caminho_saida, 'w', encoding='utf-8').write(html_gerado)

    print(f"{len(produtos)} páginas geradas em {PASTA_SITE}/")


if __name__ == '__main__':
    gerar()
