/* ════════════════════════════════════════════
   PROMO — Frete grátis acima de 10m²
   Banner de topo (discreto, dispensável).
   Carregado em todas as páginas do site.

   REMOÇÃO (25/07/2026): o popup (exit-intent / scroll / tempo) foi
   removido a pedido do Rafael — não combinava com o tom da Bruto
   (interrupção forçada). A oferta de frete grátis continua valendo e
   ligada à campanha ativa do Google Ads, mas fica só na barra de topo
   — discreta, sem forçar interação — e vira assunto pra negociar na
   própria conversa com o consultor, não uma pressão automática de
   popup. Ver COLABORACAO.md.
════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY_BANNER = 'bruto_promo_banner_dismissed';
  var DAYS_TO_RESHOW     = 3;      // depois de fechado, some por N dias

  function daysAgo(timestamp) {
    return (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
  }

  function isDismissed(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return false;
      var ts = parseInt(raw, 10);
      if (isNaN(ts)) return false;
      return daysAgo(ts) < DAYS_TO_RESHOW;
    } catch (e) {
      return false; // localStorage indisponível — não bloqueia a exibição
    }
  }

  function markDismissed(key) {
    try { localStorage.setItem(key, String(Date.now())); } catch (e) {}
  }

  // ---------- BANNER ----------
  function initBanner() {
    if (isDismissed(STORAGE_KEY_BANNER)) return;

    var bar = document.createElement('div');
    bar.className = 'promo-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Oferta especial');
    bar.innerHTML =
      '<div class="promo-bar__inner">' +
        '<i class="ti ti-truck promo-bar__icon" aria-hidden="true"></i>' +
        '<span class="promo-bar__text"><strong>Grande São Paulo é nossa casa</strong> — mas grandes projetos, a gente leva a qualquer lugar do Brasil.</span>' +
        '<a href="texturas.html" class="promo-bar__cta">Ver coleções</a>' +
        '<button type="button" class="promo-bar__close" aria-label="Fechar aviso"><i class="ti ti-x" aria-hidden="true"></i></button>' +
      '</div>';

    document.body.insertBefore(bar, document.body.firstChild);

    bar.querySelector('.promo-bar__close').addEventListener('click', function () {
      markDismissed(STORAGE_KEY_BANNER);
      bar.remove();
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initBanner();
  });
})();
