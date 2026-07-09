/* ════════════════════════════════════════════════════════════════
   ORDEM-SERVICO — Ferramenta interna (não é lead capture de cliente)
   Rafael digita os dados de um pedido recebido pelo WhatsApp e gera:
   1) PDF formatado da Ordem de Serviço (pra anexar/enviar)
   2) Mensagem de WhatsApp pronta pra encaminhar ao fornecedor

   CONFIGURAÇÃO NECESSÁRIA ANTES DE USAR DE VERDADE:
   1) FORNECEDOR_WHATSAPP — número da Cerâmica Faion (ou de quem
      recebe o pedido), formato internacional sem símbolos
      (ex: 5511987654321). Ainda é placeholder.
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var FORNECEDOR_WHATSAPP = '55SEUNUMEROAQUI'; // TODO: trocar antes de usar de verdade
  var JSPDF_CDN = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';

  var CATALOGO = [
    { slug: "brick-branco-rose", categoria: "Brick", nome: "Branco Rosé", sku: "56", preco: 153.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "brick-eco-palha", categoria: "Brick", nome: "Eco Palha", sku: "57", preco: 153.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "brick-lumus", categoria: "Brick", nome: "Lumus", sku: "73", preco: 164.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "brick-mescla-prime", categoria: "Brick", nome: "Mescla Prime", sku: "54", preco: 153.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "brick-natura", categoria: "Brick", nome: "Natura", sku: "48", preco: 104.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "brick-rosso-prime", categoria: "Brick", nome: "Rosso Prime", sku: "53", preco: 142.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "brick-rusticatto-fume", categoria: "Brick", nome: "Rusticatto Fumê", sku: "72", preco: 186.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "brick-rusticatto-rosso", categoria: "Brick", nome: "Rusticatto Rosso", sku: "77", preco: 159.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "brick-rusticatto-sertao", categoria: "Brick", nome: "Rusticatto do Sertão", sku: "61", preco: 164.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "brick-rusticatto-terra-negra", categoria: "Brick", nome: "Rusticatto Terra Negra", sku: "60", preco: 197.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "brick-terra-cerrado", categoria: "Brick", nome: "Terra do Cerrado", sku: "47", preco: 148.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "brick-vulcano", categoria: "Brick", nome: "Vulcano", sku: "59", preco: 164.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "cimenticio-alpino", categoria: "Cimentício", nome: "Alpino", sku: "80", preco: 186.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "cimenticio-grigio", categoria: "Cimentício", nome: "Grigio", sku: "81", preco: 186.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "cimenticio-urban", categoria: "Cimentício", nome: "Urban", sku: "82", preco: 186.90, dimensoes: "240mm x 65mm x 12mm" },
    { slug: "rockface-alpino", categoria: "Rockface", nome: "Alpino", sku: "91", preco: 252.90, dimensoes: "290mm x 95mm x 20mm" },
    { slug: "rockface-brisa", categoria: "Rockface", nome: "Brisa", sku: "90", preco: 186.90, dimensoes: "260mm x 75mm x 10mm" },
    { slug: "rockface-grigio", categoria: "Rockface", nome: "Grigio", sku: "92", preco: 252.90, dimensoes: "290mm x 95mm x 20mm" },
    { slug: "rockface-urban", categoria: "Rockface", nome: "Urban", sku: "93", preco: 252.90, dimensoes: "290mm x 95mm x 20mm" }
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

  /* ── Número da OS (contador local, persistido no navegador) ──── */
  function proximoNumeroOS() {
    var atual = parseInt(localStorage.getItem('os_contador') || '0', 10);
    return 'OS-' + String(atual + 1).padStart(4, '0');
  }

  function confirmarNumeroOS() {
    var atual = parseInt(localStorage.getItem('os_contador') || '0', 10);
    localStorage.setItem('os_contador', String(atual + 1));
  }

  /* ── Monta os <option> do select de produto, agrupado por categoria ── */
  function montarSelectProdutos(select) {
    var categorias = ['Brick', 'Cimentício', 'Rockface'];
    select.innerHTML = '<option value="">Selecione um produto</option>';
    categorias.forEach(function (cat) {
      var grupo = document.createElement('optgroup');
      grupo.label = cat;
      CATALOGO.filter(function (p) { return p.categoria === cat; }).forEach(function (p) {
        var opt = document.createElement('option');
        opt.value = p.slug;
        opt.textContent = p.nome + ' — ' + fmtMoeda(p.preco) + '/m²';
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
        nome: prod.nome, categoria: prod.categoria, sku: prod.sku,
        preco: preco, qtd: qtd, subtotal: preco * qtd,
        padrao: padrao, obs: obs
      });
    });

    return {
      cliente: document.getElementById('os-cliente-nome').value.trim(),
      whatsapp: document.getElementById('os-cliente-whatsapp').value.trim(),
      email: document.getElementById('os-cliente-email').value.trim(),
      endereco: document.getElementById('os-cliente-endereco').value.trim(),
      prazo: document.getElementById('os-prazo').value.trim(),
      observacoes: document.getElementById('os-observacoes').value.trim(),
      itens: itens
    };
  }

  /* ── Gera o PDF da Ordem de Serviço ───────────────────────────── */
  function gerarPDF(dados, numeroOS) {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('BRUTO', 20, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Curadoria de revestimentos artesanais', 20, y + 6);

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

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Destinatário: Cerâmica Faion', 20, y + 6);

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
    doc.text('Padrão', 78, y);
    doc.text('m²', 120, y);
    doc.text('Preço/m²', 138, y);
    doc.text('Subtotal', 168, y);
    y += 6;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    dados.itens.forEach(function (item, i) {
      if (i % 2 === 1) {
        doc.setFillColor(248, 247, 246);
        doc.rect(20, y - 4, 170, 7, 'F');
      }
      doc.setFontSize(8);
      doc.text(item.categoria + ' ' + item.nome, 23, y);
      doc.text(item.padrao || '—', 78, y);
      doc.text(String(item.qtd), 120, y);
      doc.text(fmtMoeda(item.preco), 138, y);
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
    doc.text('Gerado em ' + new Date().toLocaleString('pt-BR') + ' · uso interno BRUTO', 20, 285);

    doc.save(numeroOS.toLowerCase() + '.pdf');
  }

  /* ── Mensagem de WhatsApp pro fornecedor ──────────────────────── */
  function abrirWhatsAppFornecedor(dados, numeroOS) {
    var linhas = [
      'Pedido ' + numeroOS + ' — BRUTO',
      '',
      'Cliente: ' + (dados.cliente || '—'),
      'Entrega: ' + (dados.endereco || '—'),
      '',
      'Itens:'
    ];
    dados.itens.forEach(function (item) {
      linhas.push(
        '• ' + item.categoria + ' ' + item.nome + ' — ' + item.qtd + 'm²' +
        (item.padrao ? ' (' + item.padrao + ')' : '')
      );
    });
    if (dados.prazo) linhas.push('', 'Prazo desejado: ' + dados.prazo);
    if (dados.observacoes) linhas.push('Obs: ' + dados.observacoes);

    var msg = linhas.join('\n');
    var url = 'https://wa.me/' + FORNECEDOR_WHATSAPP + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
  }

  /* ── Botão principal ───────────────────────────────────────────── */
  var btnGerar = document.getElementById('os-gerar');
  var errEl = document.getElementById('os-error');

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

    var numeroOS = proximoNumeroOS();
    btnGerar.disabled = true;
    btnGerar.textContent = 'Gerando...';

    loadJsPDF().then(function () {
      gerarPDF(dados, numeroOS);
      abrirWhatsAppFornecedor(dados, numeroOS);
      confirmarNumeroOS();
      document.getElementById('os-numero-atual').textContent = proximoNumeroOS();
      btnGerar.disabled = false;
      btnGerar.innerHTML = '<i class="ti ti-file-download" aria-hidden="true"></i> Gerar Ordem de Serviço';
    }).catch(function () {
      errEl.textContent = 'Não foi possível gerar o PDF agora. Tente novamente.';
      errEl.hidden = false;
      btnGerar.disabled = false;
      btnGerar.innerHTML = '<i class="ti ti-file-download" aria-hidden="true"></i> Gerar Ordem de Serviço';
    });
  });

  /* ── Inicialização ─────────────────────────────────────────────── */
  document.getElementById('os-numero-atual').textContent = proximoNumeroOS();
  addItemRow();
})();
