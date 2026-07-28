"""
Gera o espelho em Markdown da KB real do atendimento (bruto/atendimento/index.html).
Roda direto em cima do código-fonte de verdade -- nunca desatualiza por edição manual
separada, porque não existe edição manual: é sempre regenerado daqui.
"""
import re
import subprocess
from datetime import datetime, timezone

CAMINHO_KB = "/home/claude/bruto/atendimento/index.html"
SAIDA = "/mnt/user-data/outputs/bruto-contexto-geral.md"

texto = open(CAMINHO_KB, encoding="utf-8").read()

# Isola o objeto KB inteiro: de "const KB = {" até a chave de fechamento
# correspondente (o "};" que vem logo antes do comentário do motor de diagnóstico).
inicio = texto.index("const KB = {")
fim = texto.index("// ── MOTOR DE DIAGNÓSTICO")
bloco_kb = texto[inicio:fim]

# Cada entrada é "chave: `conteúdo`," -- extrai por regex, respeitando template strings.
padrao = re.compile(r"^\s{2}(\w+): `(.*?)`,\s*$", re.MULTILINE | re.DOTALL)
entradas = padrao.findall(bloco_kb)

# Pega o hash do commit atual, pra rastreabilidade exata de qual versão do código
# gerou este espelho.
try:
    commit = subprocess.run(
        ["git", "-C", "/home/claude/bruto", "rev-parse", "--short", "HEAD"],
        capture_output=True, text=True, timeout=5
    ).stdout.strip() or "desconhecido"
except Exception:
    commit = "desconhecido"

agora = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC")

linhas = [
    "# Bruto Cerâmica — Contexto Geral (Espelho da KB real)",
    "",
    f"**Gerado automaticamente em {agora}, a partir do commit `{commit}` de `atendimento/index.html`.**",
    "",
    "> Este arquivo é gerado por script direto do objeto `KB` real do código — não é",
    "> digitado à mão. Editar este arquivo NÃO muda a ferramenta; e como ele é sempre",
    "> regenerado a partir do código, também nunca fica desatualizado por esquecimento",
    "> de sincronização manual (foi exatamente isso que aconteceu com a versão anterior).",
    "> Serve como backup/auditoria de leitura humana, não como fonte editável.",
    "",
    "---",
    "",
]

for chave, conteudo in entradas:
    conteudo = conteudo.strip()
    linhas.append(f"## Chave no código: `{chave}`")
    linhas.append("")
    linhas.append(conteudo)
    linhas.append("")
    linhas.append("---")
    linhas.append("")

linhas.append(f"**Total de módulos na KB: {len(entradas)}**")

with open(SAIDA, "w", encoding="utf-8") as f:
    f.write("\n".join(linhas))

print(f"Gerado: {SAIDA}")
print(f"Módulos encontrados: {len(entradas)}")
for chave, _ in entradas:
    print(f"  - {chave}")
