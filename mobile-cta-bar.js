/* ════════════════════════════════════════════
   BARRA DE CTA FIXA — mobile
   Injetada via JS em todas as páginas (mesmo padrão
   do back-to-top.js). Visível só em telas pequenas,
   aparece depois de um pequeno scroll pra não brigar
   com o hero. Mensagem do WhatsApp é contextual: se a
   página é de um produto (tem <h1> dentro de
   .product-info), inclui o nome do produto.
════════════════════════════════════════════ */
(function () {
  'use strict';

  var THRESHOLD = 120; // px de rolagem antes de aparecer

  function montarMensagem() {
    var h1Produto = document.querySelector('.product-info h1');
    if (h1Produto) {
      var nome = h1Produto.textContent.trim();
      return 'Olá! Vi o ' + nome + ' no site da Bruto e gostaria de mais informações.';
    }
    return 'Olá! Vim pelo site da Bruto e gostaria de mais informações.';
  }

  var bar = document.createElement('a');
  bar.className = 'mobile-cta-bar';
  bar.target = '_blank';
  bar.rel = 'noopener';
  bar.setAttribute('aria-label', 'Falar no WhatsApp');
  bar.innerHTML =
    '<i class="ti ti-brand-whatsapp" aria-hidden="true"></i>' +
    '<span>Falar no WhatsApp</span>';

  var dadosLeadPendente = null; // guardado da pré-computação, registrado só no clique real

  function montarHref() {
    if (!window.brutoWhatsappHrefSemRegistro) {
      return; // whatsapp-atendimento.js precisa carregar antes deste script
    }
    window.brutoWhatsappHrefSemRegistro(montarMensagem(), 'barra-fixa-mobile').then(function (r) {
      bar.href = r.url;
      dadosLeadPendente = r;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    montarHref();
    document.body.appendChild(bar);

    bar.addEventListener('click', function () {
      // Só aqui, no clique de verdade, é que o lead é registrado —
      // a pré-computação acima não gera lead nenhum sozinha.
      if (dadosLeadPendente && window.brutoRegistrarLead) {
        window.brutoRegistrarLead(dadosLeadPendente.codigo, dadosLeadPendente.dados);
      }
      if (window.brutoTrack) {
        window.brutoTrack('whatsapp_click', { link_text: 'barra-fixa-mobile', page_path: window.location.pathname });
      }
    });

    function onScroll() {
      if (window.scrollY > THRESHOLD) {
        bar.classList.add('is-visible');
      } else {
        bar.classList.remove('is-visible');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });
})();
