/* ════════════════════════════════════════════════════════════════
   ORDEM-SERVICO — Ferramenta interna (não é lead capture de cliente)
   Rafael digita os dados de um pedido recebido pelo WhatsApp e gera:
   1) PDF formatado da Ordem de Serviço (pra anexar/enviar)
   2) Mensagem de WhatsApp pronta pra encaminhar ao fornecedor

   O número de WhatsApp do fornecedor NÃO fica neste arquivo (ele é
   público no GitHub). Ele mora só no servidor, em
   api/whatsapp-fornecedor.php, e é buscado em tempo real ao clicar
   em "Gerar Ordem de Serviço".
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var JSPDF_CDN = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
  var API_SALVAR_ORDEM = 'api/salvar-ordem.php';
  var API_LISTAR_ORDENS = 'api/listar-ordens.php';
  var API_ATUALIZAR_STATUS = 'api/atualizar-status.php';
  var API_WHATSAPP_FORNECEDOR = 'api/whatsapp-fornecedor.php';
  var API_ENVIAR_EMAIL = 'api/enviar-email.php';

  var CATALOGO = [
    { slug: "brick-eco-palha", categoria: "Brick", nome: "Zulko Claro", nomeFaion: "Eco Palha", sku: "57", preco: 164.89, dimensoes: "270mm x 70mm x 15mm", peso: "350g" },
    { slug: "brick-rusticatto-palha", categoria: "Brick", nome: "Ostrek Claro", nomeFaion: "Rusticatto Palha", sku: "78", preco: 169.90, dimensoes: "270mm x 70mm x 25mm", peso: "650g" },
    { slug: "brick-lumus", categoria: "Brick", nome: "Nardek Rosado", nomeFaion: "Lumus", sku: "73", preco: 164.90, dimensoes: "270mm x 70mm x 15mm", peso: "405g" },
    { slug: "brick-mescla-prime", categoria: "Brick", nome: "Vaskir Fundo", nomeFaion: "Mescla Prime", sku: "54", preco: 164.89, dimensoes: "250mm x 70mm x 15mm", peso: "360g" },
    { slug: "brick-natura", categoria: "Brick", nome: "Yandel Âmbar", nomeFaion: "Natura", sku: "48", preco: 115.39, dimensoes: "240mm x 70mm x 10mm", peso: "465g" },
    { slug: "brick-rosso-prime", categoria: "Brick", nome: "Kelvar Aceso", nomeFaion: "Rosso Prime", sku: "53", preco: 153.89, dimensoes: "270mm x 70mm x 15mm", peso: "470g" },
    { slug: "brick-rusticatto-fume", categoria: "Brick", nome: "Thavrin Cinza", nomeFaion: "Rusticatto Fumê", sku: "72", preco: 186.90, dimensoes: "270mm x 70mm x 20mm", peso: "570g" },
    { slug: "brick-rusticatto-rosso", categoria: "Brick", nome: "Vanrik Terroso", nomeFaion: "Rusticatto Rosso", sku: "77", preco: 175.89, dimensoes: "270mm x 70mm x 20mm", peso: "590g" },
    { slug: "brick-rusticatto-sertao", categoria: "Brick", nome: "Kharun Funda", nomeFaion: "Rusticatto do Sertão", sku: "61", preco: 175.89, dimensoes: "255mm x 70mm x 22mm", peso: "610g" },
    { slug: "brick-rusticatto-terra-negra", categoria: "Brick", nome: "Ulvren Negro", nomeFaion: "Rusticatto Terra Negra", sku: "60", preco: 197.90, dimensoes: "265mm x 65mm x 20mm", peso: "585g" },
    { slug: "brick-terra-cerrado", categoria: "Brick", nome: "Zendral Cobre", nomeFaion: "Terra do Cerrado", sku: "47", preco: 159.39, dimensoes: "260mm x 70mm x 15mm", peso: "375g" },
    { slug: "cimenticio-alpino", categoria: "Cimentício", nome: "Naevel Claro", nomeFaion: "Alpino", sku: "80", preco: 186.90, dimensoes: "260mm x 75mm x 10mm", peso: "447g" },
    { slug: "cimenticio-brisa", categoria: "Cimentício", nome: "Sorvel Leve", nomeFaion: "Brisa", sku: "81", preco: 186.90, dimensoes: "260mm x 75mm x 10mm", peso: "432g" },
    { slug: "cimenticio-urban", categoria: "Cimentício", nome: "Thurgo Denso", nomeFaion: "Urban", sku: "82", preco: 186.90, dimensoes: "260mm x 75mm x 10mm", peso: "438g" },
    { slug: "rockface-alpino", categoria: "Rockface", nome: "Kelthar Branco", nomeFaion: "Alpino", sku: "91", preco: 252.90, dimensoes: "290mm x 95mm x 20mm", peso: "1325g" },
    { slug: "rockface-brisa", categoria: "Rockface", nome: "Yavrin Ameno", nomeFaion: "Brisa", sku: "90", preco: 186.90, dimensoes: "260mm x 75mm x 10mm", peso: "764g" },
    { slug: "rockface-urban", categoria: "Rockface", nome: "Rundak Bruto", nomeFaion: "Urban", sku: "92", preco: 252.90, dimensoes: "290mm x 95mm x 20mm", peso: "966g" },
    { slug: "piso-lastra-nonna", categoria: "Piso", nome: "Lastra Nonna", nomeFaion: "Lastra Nonna", sku: "87", preco: 110.90, dimensoes: "240mm x 115mm x 10mm", peso: "580g" }
  ];

  var PADROES = [
    "Amarrado Tradicional", "Junta a Prumo", "Espinha de Peixe", "Diagonal",
    "Terço Corrido", "Vertical", "Flandrês", "Americano", "Quarto Corrido",
    "Misto", "Inglês", "Inglês Cruzado", "Cesta", "Cata-vento", "Monge",
    "Jardim", "Losango", "Aleatório", "Fiadas Duplas", "Diagonal Cruzada",
    "Escama", "Junta Larga", "Xadrez Bicolor", "Módulo Quadrado", "Gótico"
  ];

  var jsPDFLoaded = false;
  var jsPDFLoading = null;

  function loadJsPDF() {
    if (jsPDFLoaded) return Promise.resolve();
    if (jsPDFLoading) return jsPDFLoading;
    jsPDFLoading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = JSPDF_CDN;
      s.onload = function () { jsPDFLoaded = true; resolve(); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return jsPDFLoading;
  }

  function fmtMoeda(v) {
    return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ── Número da OS: gerado pelo banco de dados (id sequencial),
     não mais por contador local — assim é o mesmo em qualquer
     navegador/dispositivo. Ver salvarOrdemNoBanco(). ────────────── */
  function numeroTemporario() {
    return 'TMP-' + String(Date.now()).slice(-6);
  }

  /* ── Monta os <option> do select de produto, agrupado por categoria ── */
  function montarSelectProdutos(select) {
    var categorias = ['Brick', 'Cimentício', 'Rockface', 'Piso'];
    select.innerHTML = '<option value="">Selecione um produto</option>';
    categorias.forEach(function (cat) {
      var grupo = document.createElement('optgroup');
      grupo.label = cat;
      CATALOGO.filter(function (p) { return p.categoria === cat; }).forEach(function (p) {
        var opt = document.createElement('option');
        opt.value = p.slug;
        opt.textContent = p.nome + ' (SKU ' + (p.sku || '—') + ') — ' + fmtMoeda(p.preco) + '/m²';
        grupo.appendChild(opt);
      });
      select.appendChild(grupo);
    });
  }

  function montarSelectPadroes(select) {
    select.innerHTML = '<option value="">Sem padrão definido</option>';
    PADROES.forEach(function (p) {
      var opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      select.appendChild(opt);
    });
  }

  /* ── Linha de item do pedido ──────────────────────────────────── */
  var itemsBody = document.getElementById('os-items-body');
  var itemTemplate = document.getElementById('os-item-template');

  function addItemRow() {
    var row = itemTemplate.content.firstElementChild.cloneNode(true);
    var selectProduto = row.querySelector('.os-item-produto');
    var selectPadrao = row.querySelector('.os-item-padrao');
    montarSelectProdutos(selectProduto);
    montarSelectPadroes(selectPadrao);

    var inputPreco = row.querySelector('.os-item-preco');
    var inputQtd = row.querySelector('.os-item-qtd');
    var spanSubtotal = row.querySelector('.os-item-subtotal');

    function recalcSubtotal() {
      var preco = parseFloat(inputPreco.value.replace(',', '.')) || 0;
      var qtd = parseFloat(inputQtd.value.replace(',', '.')) || 0;
      spanSubtotal.textContent = fmtMoeda(preco * qtd);
      recalcTotal();
    }

    selectProduto.addEventListener('change', function () {
      var prod = CATALOGO.filter(function (p) { return p.slug === selectProduto.value; })[0];
      inputPreco.value = prod ? prod.preco.toFixed(2).replace('.', ',') : '';
      recalcSubtotal();
    });
    inputPreco.addEventListener('input', recalcSubtotal);
    inputQtd.addEventListener('input', recalcSubtotal);

    row.querySelector('.os-item-remove').addEventListener('click', function () {
      row.remove();
      recalcTotal();
    });

    itemsBody.appendChild(row);
  }

  function recalcTotal() {
    var total = 0;
    itemsBody.querySelectorAll('tr').forEach(function (row) {
      var preco = parseFloat(row.querySelector('.os-item-preco').value.replace(',', '.')) || 0;
      var qtd = parseFloat(row.querySelector('.os-item-qtd').value.replace(',', '.')) || 0;
      total += preco * qtd;
    });
    var totalEl = document.getElementById('os-total-geral');
    if (totalEl) totalEl.textContent = fmtMoeda(total);
  }

  document.getElementById('os-add-item').addEventListener('click', addItemRow);

  /* ── Coleta os dados do formulário ────────────────────────────── */
  function coletarDados() {
    var itens = [];
    itemsBody.querySelectorAll('tr').forEach(function (row) {
      var slug = row.querySelector('.os-item-produto').value;
      var prod = CATALOGO.filter(function (p) { return p.slug === slug; })[0];
      var preco = parseFloat(row.querySelector('.os-item-preco').value.replace(',', '.')) || 0;
      var qtd = parseFloat(row.querySelector('.os-item-qtd').value.replace(',', '.')) || 0;
      var padrao = row.querySelector('.os-item-padrao').value;
      var obs = row.querySelector('.os-item-obs').value.trim();
      if (!prod || qtd <= 0) return;
      itens.push({
        nome: prod.nome, nomeFaion: prod.nomeFaion, categoria: prod.categoria, sku: prod.sku,
        preco: preco, qtd: qtd, subtotal: preco * qtd,
        padrao: padrao, obs: obs
      });
    });

    var cep = document.getElementById('os-cliente-cep').value.trim();
    var rua = document.getElementById('os-cliente-rua').value.trim();
    var numeroCasa = document.getElementById('os-cliente-numero').value.trim();
    var complemento = document.getElementById('os-cliente-complemento').value.trim();
    var bairro = document.getElementById('os-cliente-bairro').value.trim();
    var cidade = document.getElementById('os-cliente-cidade').value.trim();
    var uf = document.getElementById('os-cliente-uf').value.trim();

    var enderecoPartes = [];
    var ruaNumero = [rua, numeroCasa].filter(Boolean).join(', ');
    if (ruaNumero) enderecoPartes.push(ruaNumero);
    if (complemento) enderecoPartes.push(complemento);
    if (bairro) enderecoPartes.push(bairro);
    var cidadeUf = [cidade, uf].filter(Boolean).join(' - ');
    if (cidadeUf) enderecoPartes.push(cidadeUf);
    if (cep) enderecoPartes.push('CEP ' + cep);

    return {
      cliente: document.getElementById('os-cliente-nome').value.trim(),
      whatsapp: document.getElementById('os-cliente-whatsapp').value.trim(),
      email: document.getElementById('os-cliente-email').value.trim(),
      endereco: enderecoPartes.join(', '),
      prazo: document.getElementById('os-prazo').value.trim(),
      observacoes: document.getElementById('os-observacoes').value.trim(),
      itens: itens
    };
  }

  /* ── CEP: máscara + autopreenchimento via ViaCEP ──────────────── */
  function somenteDigitos(v) { return (v || '').replace(/\D/g, ''); }

  function formatarCep(v) {
    var d = somenteDigitos(v).slice(0, 8);
    if (d.length > 5) return d.slice(0, 5) + '-' + d.slice(5);
    return d;
  }

  function buscarEnderecoPorCep(cepDigitado) {
    var cepLimpo = somenteDigitos(cepDigitado);
    var statusEl = document.getElementById('os-cep-status');
    if (cepLimpo.length !== 8) return;

    statusEl.hidden = false;
    statusEl.textContent = 'Buscando endereço pelo CEP...';

    fetch('https://viacep.com.br/ws/' + cepLimpo + '/json/')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.erro) {
          statusEl.textContent = 'CEP não encontrado — preencha o endereço manualmente.';
          return;
        }
        document.getElementById('os-cliente-rua').value = data.logradouro || '';
        document.getElementById('os-cliente-bairro').value = data.bairro || '';
        document.getElementById('os-cliente-cidade').value = data.localidade || '';
        document.getElementById('os-cliente-uf').value = data.uf || '';
        statusEl.textContent = 'Endereço preenchido — confira e complete o número.';
        document.getElementById('os-cliente-numero').focus();
      })
      .catch(function () {
        statusEl.textContent = 'Não foi possível buscar o CEP agora — preencha manualmente.';
      });
  }

  (function initCep() {
    var cepInput = document.getElementById('os-cliente-cep');
    cepInput.addEventListener('input', function () {
      cepInput.value = formatarCep(cepInput.value);
      if (somenteDigitos(cepInput.value).length === 8) {
        buscarEnderecoPorCep(cepInput.value);
      }
    });
    cepInput.addEventListener('blur', function () {
      buscarEnderecoPorCep(cepInput.value);
    });
  })();

  /* ── Gera o PDF da Ordem de Serviço ───────────────────────────── */
  /* ── Logotipo BRUTO — mesmas coordenadas do SVG oficial do site
     (viewBox "44 22 192 302"), redesenhado com retângulos porque
     é só isso que o desenho usa: um bloco preto com duas "janelas"
     brancas recortadas por cima, formando o B. ──────────────────── */
  function desenharLogo(doc, x, y, largura) {
    var viewBoxMinX = 44, viewBoxMinY = 22, viewBoxW = 192;
    var escala = largura / viewBoxW;
    function px(sx) { return x + (sx - viewBoxMinX) * escala; }
    function py(sy) { return y + (sy - viewBoxMinY) * escala; }

    doc.setFillColor(10, 10, 10);
    doc.rect(px(52), py(30), (184 - 52) * escala, (162 - 30) * escala, 'F');
    doc.rect(px(52), py(162), (228 - 52) * escala, (316 - 162) * escala, 'F');

    doc.setFillColor(255, 255, 255);
    doc.rect(px(74), py(52), (162 - 74) * escala, (162 - 52) * escala, 'F');
    doc.rect(px(74), py(184), (206 - 74) * escala, (294 - 184) * escala, 'F');
  }

  // destino: 'faion' usa o nome que a Faion reconhece nos produtos dela
  // (a OS enviada pro fornecedor precisa bater com o catálogo DELA, senão
  // o pedido não faz sentido pra quem recebe) — 'cliente' (padrão) usa o
  // nome comercial novo da Bruto, que é o que aparece no site e em todo
  // o resto da documentação. O SKU aparece nas duas versões, já que é o
  // elo neutro entre os dois sistemas de nome (Rafael pediu, 03/09/2026).
  function gerarPDF(dados, numeroOS, destino) {
    destino = destino || 'cliente';
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var y = 20;

    desenharLogo(doc, 20, 14, 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('BRUTO', 33, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Curadoria de revestimentos artesanais', 33, y + 6);

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(numeroOS, 190, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(new Date().toLocaleDateString('pt-BR'), 190, y + 6, { align: 'right' });

    y += 16;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);

    y += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('Ordem de Serviço', 20, y);

    y += 16;
    doc.setDrawColor(230, 230, 230);
    doc.setFillColor(245, 244, 242);
    doc.rect(20, y, 170, 24, 'F');
    y += 7;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Cliente final', 25, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.cliente || '—', 65, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Contato', 25, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.whatsapp + (dados.email ? '  ·  ' + dados.email : ''), 65, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Entrega em', 25, y);
    doc.setFont('helvetica', 'normal');
    var enderecoLinhas = doc.splitTextToSize(dados.endereco || '—', 120);
    doc.text(enderecoLinhas, 65, y);

    y += 16;

    /* ── Tabela de itens ─────────────────────────────────────────── */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Itens do pedido', 20, y);
    y += 7;

    doc.setFillColor(10, 10, 10);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, y - 5, 170, 7, 'F');
    doc.setFontSize(8);
    doc.text('Produto', 23, y);
    doc.text('SKU', 68, y);
    doc.text('Padrão', 82, y);
    doc.text('m²', 122, y);
    doc.text('Preço/m²', 140, y);
    doc.text('Subtotal', 168, y);
    y += 6;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    dados.itens.forEach(function (item, i) {
      if (i % 2 === 1) {
        doc.setFillColor(248, 247, 246);
        doc.rect(20, y - 4, 170, 7, 'F');
      }
      var nomeExibido = destino === 'faion' ? (item.nomeFaion || item.nome) : item.nome;
      doc.setFontSize(8);
      doc.text(item.categoria + ' ' + nomeExibido, 23, y);
      doc.text(item.sku || '—', 68, y);
      doc.text(item.padrao || '—', 82, y);
      doc.text(String(item.qtd), 122, y);
      doc.text(fmtMoeda(item.preco), 140, y);
      doc.text(fmtMoeda(item.subtotal), 168, y);
      y += 7;
      if (item.obs) {
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text('Obs: ' + item.obs, 23, y);
        doc.setTextColor(0, 0, 0);
        y += 5;
      }
    });

    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 8;

    var totalGeral = dados.itens.reduce(function (acc, it) { return acc + it.subtotal; }, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total geral', 138, y);
    doc.text(fmtMoeda(totalGeral), 168, y);

    if (dados.prazo || dados.observacoes) {
      y += 14;
      if (dados.prazo) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Prazo desejado', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(dados.prazo, 65, y);
        y += 7;
      }
      if (dados.observacoes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Observações', 20, y);
        doc.setFont('helvetica', 'normal');
        var obsLinhas = doc.splitTextToSize(dados.observacoes, 120);
        doc.text(obsLinhas, 65, y);
      }
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Gerado em ' + new Date().toLocaleString('pt-BR') + ' · uso interno BRUTO · brutoceramica.com.br · contato@brutoceramica.com.br', 20, 285);

    var pdfBase64 = doc.output('datauristring');
    var sufixo = destino === 'faion' ? '-Faion' : '';
    doc.save(numeroOS.toLowerCase() + sufixo + '.pdf');
    return pdfBase64;
  }

  /* ── Salva a ordem no banco de dados (não bloqueia PDF/WhatsApp) ── */
  /* ── Salva a ordem no banco PRIMEIRO — o número da OS vem da
     resposta do servidor (id sequencial do MySQL), então é único
     em qualquer navegador/dispositivo. Retorna uma Promise que
     resolve com { numero_os, id }. ─────────────────────────────── */
  function salvarOrdemNoBanco(dados) {
    var totalGeral = dados.itens.reduce(function (acc, it) { return acc + it.subtotal; }, 0);

    var contatoPartes = [];
    if (dados.whatsapp) contatoPartes.push(dados.whatsapp);
    if (dados.email) contatoPartes.push(dados.email);

    var obsPartes = [];
    if (dados.endereco) obsPartes.push('Entrega: ' + dados.endereco);
    if (dados.prazo) obsPartes.push('Prazo: ' + dados.prazo);
    if (dados.observacoes) obsPartes.push(dados.observacoes);

    var payload = {
      cliente_nome: dados.cliente,
      cliente_contato: contatoPartes.join(' · '),
      itens: dados.itens,
      total_geral: totalGeral,
      observacoes: obsPartes.join(' | ')
    };

    return fetch(API_SALVAR_ORDEM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json(); })
      .then(function (resultado) {
        if (!resultado || !resultado.sucesso || !resultado.numero_os) {
          throw new Error((resultado && resultado.erro) || 'Resposta inesperada do servidor.');
        }
        return resultado;
      });
  }

  /* ── Mensagem do pedido — reutilizada no WhatsApp e no e-mail ──── */
  // Mesmo raciocínio do gerarPDF: 'faion' usa o nome que o fornecedor
  // reconhece no catálogo dele, 'cliente' (padrão) usa o nome comercial
  // novo da Bruto. SKU incluído nos dois — é o elo neutro entre os
  // dois sistemas de nome.
  function montarMensagemPedido(dados, numeroOS, destino) {
    destino = destino || 'cliente';
    var linhas = [
      'Pedido ' + numeroOS + ' — BRUTO',
      '',
      'Cliente: ' + (dados.cliente || '—'),
      'Entrega: ' + (dados.endereco || '—'),
      '',
      'Itens:'
    ];
    dados.itens.forEach(function (item) {
      var nomeExibido = destino === 'faion' ? (item.nomeFaion || item.nome) : item.nome;
      linhas.push(
        '• ' + item.categoria + ' ' + nomeExibido + (item.sku ? ' (SKU ' + item.sku + ')' : '') +
        ' — ' + item.qtd + 'm²' +
        (item.padrao ? ' (' + item.padrao + ')' : '')
      );
    });
    if (dados.prazo) linhas.push('', 'Prazo desejado: ' + dados.prazo);
    if (dados.observacoes) linhas.push('Obs: ' + dados.observacoes);
    return linhas.join('\n');
  }

  /* ── Mensagem de WhatsApp pro fornecedor ──────────────────────── */
  function abrirWhatsAppFornecedor(dados, numeroOS) {
    var msg = montarMensagemPedido(dados, numeroOS, 'faion');

    // Abre a aba já (dentro do clique do usuário, senão o navegador
    // bloqueia como pop-up) e só troca a URL dela quando o número
    // do fornecedor chegar do servidor.
    var janela = window.open('', '_blank');

    fetch(API_WHATSAPP_FORNECEDOR)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.numero) throw new Error('Número do fornecedor ausente na resposta.');
        var url = 'https://wa.me/' + data.numero + '?text=' + encodeURIComponent(msg);
        if (janela) {
          janela.location.href = url;
        } else {
          window.open(url, '_blank');
        }
      })
      .catch(function (err) {
        console.warn('Não foi possível obter o WhatsApp do fornecedor:', err);
        if (janela) janela.close();
        errEl.textContent = 'PDF gerado, mas não consegui abrir o WhatsApp do fornecedor agora. Tente novamente em instantes.';
        errEl.hidden = false;
      });
  }

  /* ── Envia cópia interna por e-mail, com PDF anexado (não bloqueia) ── */
  function enviarCopiaPorEmail(dados, numeroOS, pdfBase64) {
    var msg = montarMensagemPedido(dados, numeroOS);

    fetch(API_ENVIAR_EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numero_os: numeroOS,
        corpo_texto: msg,
        pdf_base64: pdfBase64,
        email_cliente: dados.email || ''
      })
    }).catch(function (err) {
      // Falha silenciosa: PDF, WhatsApp e banco já funcionaram normalmente,
      // o e-mail é um extra e não deve travar o fluxo do usuário.
      console.warn('Não foi possível enviar a cópia por e-mail:', err);
    });
  }

  /* ── Botão principal ───────────────────────────────────────────── */
  var btnGerar = document.getElementById('os-gerar');
  var errEl = document.getElementById('os-error');

  function gerarTudo(dados, numeroOS) {
    return loadJsPDF().then(function () {
      // Dois PDFs distintos: um com o nome que a Faion reconhece (vai só
      // pro WhatsApp do fornecedor), outro com o nome comercial novo da
      // Bruto (fica salvo localmente e vai por e-mail — é a cópia que
      // representa o pedido pro cliente/uso interno). Pedido do Rafael,
      // 03/09/2026: nome novo em tudo, com o SKU como elo confiável pra
      // Faion continuar reconhecendo o pedido mesmo com o nome mudado.
      var pdfCliente = gerarPDF(dados, numeroOS, 'cliente');
      gerarPDF(dados, numeroOS, 'faion');
      abrirWhatsAppFornecedor(dados, numeroOS);
      enviarCopiaPorEmail(dados, numeroOS, pdfCliente);
      document.getElementById('os-numero-atual').textContent = 'Nova OS';
    });
  }

  btnGerar.addEventListener('click', function () {
    errEl.hidden = true;
    var dados = coletarDados();

    if (!dados.cliente || !dados.whatsapp) {
      errEl.textContent = 'Preencha ao menos o nome e o WhatsApp do cliente.';
      errEl.hidden = false;
      return;
    }
    if (dados.itens.length === 0) {
      errEl.textContent = 'Adicione pelo menos um item com produto e quantidade.';
      errEl.hidden = false;
      return;
    }

    btnGerar.disabled = true;
    btnGerar.textContent = 'Gerando...';

    // Salva no banco PRIMEIRO — o número oficial da OS vem da resposta
    // do servidor (id sequencial), garantindo que nunca se repete,
    // mesmo entre navegadores/dispositivos diferentes.
    salvarOrdemNoBanco(dados)
      .then(function (resultado) {
        return { numeroOS: resultado.numero_os, avisoBanco: null };
      })
      .catch(function (err) {
        // Se o banco não respondeu, ainda assim gera tudo com um número
        // temporário — não trava o atendimento — mas avisa claramente.
        console.warn('Não foi possível confirmar o número oficial da OS:', err);
        var numeroTemp = numeroTemporario();
        return {
          numeroOS: numeroTemp,
          avisoBanco: 'Atenção: não consegui confirmar com o banco de dados agora — a OS foi gerada com número temporário (' + numeroTemp + ') e pode não ter sido salva. Confira depois.'
        };
      })
      .then(function (info) {
        return gerarTudo(dados, info.numeroOS).then(function () {
          if (info.avisoBanco) {
            errEl.textContent = info.avisoBanco;
            errEl.hidden = false;
          }
        });
      })
      .catch(function () {
        errEl.textContent = 'Não foi possível gerar o PDF agora. Tente novamente.';
        errEl.hidden = false;
      })
      .then(function () {
        btnGerar.disabled = false;
        btnGerar.innerHTML = '<i class="ti ti-file-download" aria-hidden="true"></i> Gerar Ordem de Serviço';
      });
  });

  /* ── Histórico de Ordens de Serviço ───────────────────────────── */
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtDataHora(str) {
    if (!str) return '—';
    // vem do banco como "YYYY-MM-DD HH:MM:SS" — Safari não faz parse
    // disso direto, então troca o espaço por "T" antes.
    var d = new Date(str.replace(' ', 'T'));
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  var STATUS_OPCOES = ['pendente', 'em produção', 'concluído', 'cancelado'];

  function montarSelectStatus(id, statusAtual) {
    var atual = statusAtual || 'pendente';
    var opts = STATUS_OPCOES.map(function (s) {
      var sel = s === atual ? ' selected' : '';
      return '<option value="' + escapeHtml(s) + '"' + sel + '>' + escapeHtml(s) + '</option>';
    }).join('');
    return '<select class="os-hist-status" data-id="' + id + '" data-anterior="' + escapeHtml(atual) + '">' + opts + '</select>';
  }

  function renderHistorico(ordens) {
    var el = document.getElementById('os-hist-conteudo');
    if (!ordens || ordens.length === 0) {
      el.innerHTML = '<div class="os-hist-empty">Nenhuma ordem de serviço registrada ainda.</div>';
      return;
    }
    var linhas = ordens.map(function (o) {
      var qtdItens = (o.itens && o.itens.length) || 0;
      return (
        '<tr>' +
        '<td><strong>' + escapeHtml(o.numero_os) + '</strong></td>' +
        '<td>' + escapeHtml(o.cliente_nome) + '</td>' +
        '<td>' + escapeHtml(o.criado_por || '—') + '</td>' +
        '<td>' + fmtDataHora(o.criado_em) + '</td>' +
        '<td>' + qtdItens + ' ' + (qtdItens === 1 ? 'item' : 'itens') + '</td>' +
        '<td>' + fmtMoeda(parseFloat(o.total_geral) || 0) + '</td>' +
        '<td>' + montarSelectStatus(o.id, o.status) + '</td>' +
        '</tr>'
      );
    }).join('');
    el.innerHTML =
      '<table class="os-hist-table">' +
      '<thead><tr>' +
      '<th>Nº OS</th><th>Cliente</th><th>Enviado por</th><th>Data/hora</th><th>Itens</th><th>Total</th><th>Status</th>' +
      '</tr></thead>' +
      '<tbody>' + linhas + '</tbody>' +
      '</table>';
  }

  function atualizarStatus(select) {
    var id = select.getAttribute('data-id');
    var anterior = select.getAttribute('data-anterior');
    var novo = select.value;
    select.disabled = true;
    fetch(API_ATUALIZAR_STATUS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, status: novo })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.sucesso) throw new Error((data && data.erro) || 'Resposta inesperada.');
        select.setAttribute('data-anterior', novo);
      })
      .catch(function () {
        // Falhou — volta pro valor anterior e avisa.
        select.value = anterior;
        alert('Não consegui salvar esse status agora. Tente de novo.');
      })
      .then(function () {
        select.disabled = false;
      });
  }

  function carregarHistorico() {
    var el = document.getElementById('os-hist-conteudo');
    el.innerHTML = '<div class="os-hist-loading">Carregando...</div>';
    fetch(API_LISTAR_ORDENS + '?limite=100')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.sucesso) throw new Error((data && data.erro) || 'Resposta inesperada.');
        renderHistorico(data.ordens);
      })
      .catch(function () {
        el.innerHTML = '<div class="os-hist-empty">Não consegui carregar o histórico agora. Tente novamente.</div>';
      });
  }

  (function initHistorico() {
    var overlay = document.getElementById('os-hist-overlay');
    var btnAbrir = document.getElementById('os-historico-btn');
    var btnFechar = document.getElementById('os-hist-fechar');
    if (!overlay || !btnAbrir) return;

    btnAbrir.addEventListener('click', function () {
      overlay.hidden = false;
      carregarHistorico();
    });
    btnFechar.addEventListener('click', function () { overlay.hidden = true; });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.hidden = true;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) overlay.hidden = true;
    });

    // Delegado: a tabela é recriada a cada vez que o histórico recarrega,
    // então o listener fica no container, não em cada <select>.
    var conteudo = document.getElementById('os-hist-conteudo');
    if (conteudo) {
      conteudo.addEventListener('change', function (e) {
        if (e.target && e.target.classList.contains('os-hist-status')) {
          atualizarStatus(e.target);
        }
      });
    }
  })();

  /* ── Inicialização ─────────────────────────────────────────────── */
  document.getElementById('os-numero-atual').textContent = 'Nova OS';
  addItemRow();
})();
