/* ════════════════════════════════════════════════════════════════
   LEAD-PDF — Modal de captura + PDF rico + notificação via WhatsApp
   Carregado nas páginas de produto (botão "Baixar PDF com meus dados").

   LEAD_ENDPOINT: substituiu o Formspree em 25/07/2026 — agora envia
   pro próprio servidor da Bruto (bruto-secrets/API/enviar-lead.php),
   via PHPMailer, sem depender de serviço terceiro.
   Número de WhatsApp vem do rodízio de atendentes — ver
   whatsapp-atendimento.js (precisa carregar antes deste script).
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var LEAD_ENDPOINT = 'api/enviar-lead.php';
  var JSPDF_CDN = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
  var HTML2CANVAS_CDN = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';

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

  var html2canvasLoaded = false;
  var html2canvasLoading = null;

  function loadHtml2Canvas() {
    if (html2canvasLoaded) return Promise.resolve();
    if (html2canvasLoading) return html2canvasLoading;
    html2canvasLoading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = HTML2CANVAS_CDN;
      s.onload = function () { html2canvasLoaded = true; resolve(); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return html2canvasLoading;
  }

  /* ── Captura a simulação de parede (.pgn-wall) como imagem ──────
     Retorna null se a página não tiver o simulador de paginação,
     ou se a captura falhar por qualquer motivo (nunca bloqueia o
     fluxo de geração do PDF). ──────────────────────────────────── */
  function capturarSimulacaoParede() {
    var wallEl = document.querySelector('.pgn-wall');
    if (!wallEl) return Promise.resolve(null);
    return loadHtml2Canvas().then(function () {
      return window.html2canvas(wallEl, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
        logging: false
      });
    }).then(function (canvas) {
      return {
        dataUrl: canvas.toDataURL('image/jpeg', 0.88),
        width: canvas.width,
        height: canvas.height
      };
    }).catch(function () {
      return null; // captura é um extra — se falhar, o PDF sai sem essa página
    });
  }

  /* ── Constrói o modal uma única vez ──────────────────────────── */
  var modal = document.createElement('div');
  modal.className = 'lead-modal';
  modal.innerHTML =
    '<div class="lead-modal__overlay" data-close></div>' +
    '<div class="lead-modal__card" role="dialog" aria-modal="true" aria-label="Baixar PDF personalizado">' +
      '<button type="button" class="lead-modal__close" data-close aria-label="Fechar"><i class="ti ti-x" aria-hidden="true"></i></button>' +
      '<div class="lead-modal__step" data-step="form">' +
        '<p class="eyebrow">PDF personalizado</p>' +
        '<h3 class="lead-modal__title">Receba seu orçamento em PDF</h3>' +
        '<p class="lead-modal__body">Preencha seus dados para gerar um PDF com o cálculo completo — m², peças, valor estimado e padrão de assentamento escolhido.</p>' +
        '<form class="lead-modal__form" id="lead-modal-form">' +
          '<label class="lead-modal__field">' +
            '<span>Nome</span>' +
            '<input type="text" name="nome" required placeholder="Seu nome">' +
          '</label>' +
          '<label class="lead-modal__field">' +
            '<span>WhatsApp</span>' +
            '<input type="tel" name="whatsapp" required placeholder="(11) 91234-5678">' +
          '</label>' +
          '<label class="lead-modal__field">' +
            '<span>E-mail <em>(opcional)</em></span>' +
            '<input type="email" name="email" placeholder="voce@email.com">' +
          '</label>' +
          '<button type="submit" class="btn btn--primary lead-modal__submit">' +
            '<i class="ti ti-file-download" aria-hidden="true"></i> Gerar meu PDF' +
          '</button>' +
          '<p class="lead-modal__error" hidden></p>' +
        '</form>' +
      '</div>' +
      '<div class="lead-modal__step" data-step="done" hidden>' +
        '<div class="lead-modal__done-icon"><i class="ti ti-check" aria-hidden="true"></i></div>' +
        '<h3 class="lead-modal__title">PDF baixado!</h3>' +
        '<p class="lead-modal__body">Abrimos o WhatsApp com seus dados prontos — é só confirmar o envio para nossa equipe entrar em contato.</p>' +
        '<button type="button" class="btn btn--outline" data-close>Fechar</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  var currentBtn = null;

  function openModal(btn) {
    currentBtn = btn;
    var titleEl = modal.querySelector('[data-step="form"] .lead-modal__title');
    var bodyEl = modal.querySelector('[data-step="form"] .lead-modal__body');
    titleEl.textContent = btn.getAttribute('data-modal-title') || 'Receba seu orçamento em PDF';
    bodyEl.textContent = btn.getAttribute('data-modal-body') ||
      'Preencha seus dados para gerar um PDF com o cálculo completo — m², peças, valor estimado e padrão de assentamento escolhido.';
    modal.querySelector('[data-step="form"]').hidden = false;
    modal.querySelector('[data-step="done"]').hidden = true;
    modal.querySelector('.lead-modal__error').hidden = true;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var firstInput = modal.querySelector('input[name="nome"]');
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  /* ── Lê os dados já calculados na página (calculadora + padrão) ── */
  function readPageData() {
    function txt(id) {
      var el = document.getElementById(id);
      return el ? el.textContent.trim() : '—';
    }
    function getSpec(label) {
      var items = document.querySelectorAll('.product-specs .spec-item');
      for (var i = 0; i < items.length; i++) {
        var strong = items[i].querySelector('strong');
        if (strong && strong.textContent.indexOf(label) !== -1) {
          var span = items[i].querySelector('span');
          return span ? span.textContent.trim() : '—';
        }
      }
      return '—';
    }
    var corEl = document.querySelector('.pgn-current-name');
    var padraoEl = document.querySelector('.pgn-pattern-btn.is-active');
    var ambienteEl = document.querySelector('.pgn-ambient-toggle .pgn-chip.is-active');

    return {
      produto:      currentBtn ? currentBtn.getAttribute('data-product-name') : '—',
      linha:        currentBtn ? currentBtn.getAttribute('data-product-line') : '—',
      precoM2:      currentBtn ? currentBtn.getAttribute('data-product-price') : '—',
      dimensaoPeca: getSpec('Dimens'),
      areaInformada: (document.getElementById('calc-area-input') || {}).value || '—',
      m2:        txt('calc-m2'),
      pecas:     txt('calc-pecas'),
      valor:     txt('calc-total'),
      cor:       corEl ? corEl.textContent.trim() : '—',
      padrao:    padraoEl ? padraoEl.textContent.trim() : '—',
      ambiente:  ambienteEl ? ambienteEl.textContent.trim() : '—'
    };
  }

  /* ── Gera o PDF com jsPDF ─────────────────────────────────────── */
  function desenharLogo(doc, x, y, largura) {
    // Mesmo monograma vetorial usado na Ordem de Serviço (Manual de
    // Identidade Visual V1.0) — desenhado com retângulos, não é texto.
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

  function gerarPDF(dados, lead, wallImage) {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var y = 22;

    desenharLogo(doc, 20, 14, 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('BRUTO', 33, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Curadoria de revestimentos artesanais', 33, y + 6);
    doc.setTextColor(0, 0, 0);

    y += 20;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);

    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('Orçamento personalizado', 20, y);

    y += 12;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Produto', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.linha + ' — ' + dados.produto + '  (R$ ' + dados.precoM2 + '/m²)', 60, y);

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Dimensões da peça', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.dimensaoPeca, 70, y);

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Área informada', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.areaInformada + ' m²', 70, y);

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Padrão de assentamento', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.padrao, 75, y);

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Cor selecionada', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.cor, 75, y);

    y += 14;
    doc.setDrawColor(230, 230, 230);
    doc.setFillColor(245, 244, 242);
    doc.rect(20, y, 170, 32, 'F');
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(dados.m2, 30, y);
    doc.text(dados.pecas, 90, y);
    doc.text(dados.valor, 150, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('m² necessários', 30, y + 6);
    doc.text('peças necessárias', 90, y + 6);
    doc.text('valor estimado', 150, y + 6);

    y += 30;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Estimativa sujeita a confirmação técnica. Valores e disponibilidade podem variar.', 20, y);

    y += 20;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text('Preparado para', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(lead.nome, 60, y);
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Contato', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(lead.whatsapp + (lead.email ? '  ·  ' + lead.email : ''), 60, y);

    y += 20;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Gerado em ' + new Date().toLocaleDateString('pt-BR') + ' · brutoceramica.com.br · contato@brutoceramica.com.br', 20, y);

    /* ── Página 2: simulação visual na parede (quando capturada) ── */
    if (wallImage) {
      doc.addPage();
      var py = 22;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Simulação na parede', 20, py);

      py += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        dados.linha + ' — ' + dados.produto + '  ·  ' + dados.cor + '  ·  ' + dados.padrao +
        '  ·  ambiente ' + dados.ambiente,
        20, py
      );

      py += 10;
      var imgW = 170;
      var imgH = imgW * (wallImage.height / wallImage.width);
      var maxH = 240; // limite pra não estourar a página em imagens muito altas
      if (imgH > maxH) { imgH = maxH; imgW = imgH * (wallImage.width / wallImage.height); }
      doc.addImage(wallImage.dataUrl, 'JPEG', 20, py, imgW, imgH);

      py += imgH + 10;
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Simulação ilustrativa — cores e textura reais podem variar por lote e iluminação.', 20, py);
    }

    doc.save('orcamento-bruto-' + dados.produto.toLowerCase().replace(/\s+/g, '-') + '.pdf');
  }

  function enviarLead(dados, lead) {
    return fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _subject: 'Orçamento via PDF — ' + lead.nome,
        nome: lead.nome, whatsapp: lead.whatsapp, email: lead.email || '',
        produto: dados.linha + ' — ' + dados.produto,
        area: dados.areaInformada + 'm²',
        m2: dados.m2, pecas: dados.pecas, valor: dados.valor, padrao: dados.padrao
      })
    }).then(function (res) {
      if (window.brutoTrack) {
        window.brutoTrack('form_submit', { form_type: 'orcamento-completo', produto: dados.linha + ' — ' + dados.produto, valor: dados.valor });
      }
      return res;
    }).catch(function () { /* não bloqueia o fluxo se o envio falhar */ });
  }

  function abrirWhatsApp(dados, lead) {
    var msg = 'Olá! Sou ' + lead.nome + ' e gostaria de um orçamento.\n' +
      'Produto: ' + dados.linha + ' — ' + dados.produto + '\n' +
      'Área informada: ' + dados.areaInformada + 'm² (' + dados.m2 + ' com perda)\n' +
      'Padrão: ' + dados.padrao + '\n' +
      'Valor estimado: ' + dados.valor;
    if (window.brutoTrack) {
      window.brutoTrack('whatsapp_click', { link_text: 'calculadora-orcamento', produto: dados.linha + ' — ' + dados.produto, valor: dados.valor });
    }
    // Abre a aba já (dentro do clique do usuário, senão o navegador
    // bloqueia como pop-up) e só troca a URL dela quando o número
    // do atendente distribuído chegar.
    var janela = window.open('', '_blank');
    if (window.brutoWhatsappHref) {
      window.brutoWhatsappHref(msg).then(function (url) {
        if (janela) { janela.location.href = url; } else { window.open(url, '_blank'); }
      });
    } else if (janela) {
      janela.close();
    }
  }

  function enviarLeadSimples(lead, origem) {
    return fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _subject: 'Download de guia — ' + lead.nome,
        nome: lead.nome, whatsapp: lead.whatsapp, email: lead.email || '',
        origem: origem
      })
    }).then(function (res) {
      if (window.brutoTrack) {
        window.brutoTrack('form_submit', { form_type: 'origem-' + origem });
      }
      return res;
    }).catch(function () { /* não bloqueia o fluxo se o envio falhar */ });
  }

  function baixarArquivoEstatico(caminho) {
    var a = document.createElement('a');
    a.href = caminho;
    a.setAttribute('download', '');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function abrirWhatsAppGenerico(lead, nomeConteudo) {
    var msg = 'Olá! Sou ' + lead.nome + ' e acabei de baixar o ' + nomeConteudo +
      ' no site da BRUTO. Gostaria de mais informações.';
    // Abre a aba já (dentro do clique do usuário, senão o navegador
    // bloqueia como pop-up) e só troca a URL dela quando o número
    // do atendente distribuído chegar.
    var janela = window.open('', '_blank');
    if (window.brutoWhatsappHref) {
      window.brutoWhatsappHref(msg).then(function (url) {
        if (janela) { janela.location.href = url; } else { window.open(url, '_blank'); }
      });
    } else if (janela) {
      janela.close();
    }
  }

  /* ── Submit do formulário ─────────────────────────────────────── */
  var form = modal.querySelector('#lead-modal-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var errEl = modal.querySelector('.lead-modal__error');
    errEl.hidden = true;

    var lead = {
      nome: form.nome.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      email: form.email.value.trim()
    };

    var submitBtn = form.querySelector('.lead-modal__submit');
    var staticPdf = currentBtn ? currentBtn.getAttribute('data-static-pdf') : null;

    /* ── Modo estático: PDF já pronto (ex.: Guia de Paginações) ──
       Sem calculadora nem simulador — só captura o lead, dispara o
       download do arquivo existente e abre o WhatsApp com mensagem
       genérica. Não gera PDF dinâmico com jsPDF. ────────────────── */
    if (staticPdf) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      var nomeConteudo = currentBtn.getAttribute('data-content-name') || 'guia em PDF';
      enviarLeadSimples(lead, 'pdf-estatico:' + staticPdf).then(function () {
        baixarArquivoEstatico(staticPdf);
        abrirWhatsAppGenerico(lead, nomeConteudo);
        modal.querySelector('[data-step="form"]').hidden = true;
        modal.querySelector('[data-step="done"]').hidden = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ti ti-file-download" aria-hidden="true"></i> Gerar meu PDF';
        form.reset();
        setTimeout(function () { window.location.href = 'obrigado.html?origem=paginacoes'; }, 4000);
      });
      return;
    }

    var dados = readPageData();
    if (dados.m2 === '—') {
      errEl.textContent = 'Preencha a calculadora de quantidade acima antes de gerar o PDF.';
      errEl.hidden = false;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Gerando...';

    loadJsPDF().then(function () {
      return capturarSimulacaoParede().then(function (wallImage) {
        gerarPDF(dados, lead, wallImage);
        enviarLead(dados, lead);
        abrirWhatsApp(dados, lead);

        modal.querySelector('[data-step="form"]').hidden = true;
        modal.querySelector('[data-step="done"]').hidden = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ti ti-file-download" aria-hidden="true"></i> Gerar meu PDF';
        form.reset();
        setTimeout(function () { window.location.href = 'obrigado.html?origem=calculadora'; }, 4000);
      });
    }).catch(function () {
      errEl.textContent = 'Não foi possível gerar o PDF agora. Tente novamente.';
      errEl.hidden = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="ti ti-file-download" aria-hidden="true"></i> Gerar meu PDF';
    });
  });

  /* ── Liga os botões-gatilho da página ─────────────────────────── */
  document.querySelectorAll('.lead-pdf__trigger').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal(btn); });
  });
})();
