/* ════════════════════════════════════════════
   PROMO — Frete grátis acima de 10m²
   Banner de topo + popup (exit-intent / scroll / tempo)
   Carregado em todas as páginas do site.
════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY_BANNER = 'bruto_promo_banner_dismissed';
  var STORAGE_KEY_POPUP  = 'bruto_promo_popup_seen';
  var DAYS_TO_RESHOW     = 3;      // depois de fechado, some por N dias
  var SCROLL_TRIGGER_PCT = 0.5;    // dispara o popup em 50% de rolagem
  var TIME_TRIGGER_MS    = 25000;  // ou após 25s na página, o que vier primeiro

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

  // Só o index.html tem a seção #amostra. Nas outras páginas, leva pra lá.
  // Usado pelo banner (topo), que é menos intrusivo — mantém o fluxo normal.
  function ctaHref() {
    return document.getElementById('amostra') ? '#amostra' : 'index.html#amostra';
  }

  // Usado pelo popup — quem já rolou a página, ficou 25s ou deu exit-intent
  // é lead quente, então vai direto pro WhatsApp com a promo já contextualizada,
  // sem passo extra pela seção #amostra.
  var WHATSAPP_NUMBER = '5511990049468';
  function popupCtaHref() {
    var msg = 'Olá! Vi a oferta de frete grátis acima de 10m\u00b2 e quero aproveitar.';
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
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
        '<span class="promo-bar__text"><strong>Frete grátis</strong> em compras acima de 10m\u00b2 — garanta o seu.</span>' +
        '<a href="' + ctaHref() + '" class="promo-bar__cta">Quero meu frete grátis</a>' +
        '<button type="button" class="promo-bar__close" aria-label="Fechar aviso"><i class="ti ti-x" aria-hidden="true"></i></button>' +
      '</div>';

    document.body.insertBefore(bar, document.body.firstChild);

    bar.querySelector('.promo-bar__close').addEventListener('click', function () {
      markDismissed(STORAGE_KEY_BANNER);
      bar.remove();
    });
  }

  // ---------- POPUP ----------
  function initPopup() {
    if (isDismissed(STORAGE_KEY_POPUP)) return;

    var shown = false;
    var timeoutId = null;

    var overlay = document.createElement('div');
    overlay.className = 'promo-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Oferta de frete grátis');
    overlay.innerHTML =
      '<div class="promo-modal__card">' +
        '<button type="button" class="promo-modal__close" aria-label="Fechar"><i class="ti ti-x" aria-hidden="true"></i></button>' +
        '<i class="ti ti-truck promo-modal__icon" aria-hidden="true"></i>' +
        '<span class="promo-modal__eyebrow">Oferta por tempo limitado</span>' +
        '<h3 class="promo-modal__title">Frete grátis acima de 10m\u00b2</h3>' +
        '<p class="promo-modal__body">Fale com a gente agora e garanta o benefício antes de fechar seu pedido.</p>' +
        '<a href="' + popupCtaHref() + '" target="_blank" rel="noopener" class="promo-modal__cta">Quero meu frete grátis</a>' +
        '<button type="button" class="promo-modal__dismiss">Agora não</button>' +
      '</div>';

    function onKeydown(e) {
      if (e.key === 'Escape') close(false);
    }

    function open() {
      if (shown) return;
      shown = true;
      if (timeoutId) clearTimeout(timeoutId);
      document.body.appendChild(overlay);
      requestAnimationFrame(function () { overlay.classList.add('is-visible'); });
      document.addEventListener('keydown', onKeydown);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseleave', onMouseLeave);
    }

    function close(remember) {
      overlay.classList.remove('is-visible');
      document.removeEventListener('keydown', onKeydown);
      setTimeout(function () { overlay.remove(); }, 250);
      if (remember) markDismissed(STORAGE_KEY_POPUP);
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close(false);
    });
    overlay.querySelector('.promo-modal__close').addEventListener('click', function () { close(true); });
    overlay.querySelector('.promo-modal__dismiss').addEventListener('click', function () { close(true); });
    overlay.querySelector('.promo-modal__cta').addEventListener('click', function () { markDismissed(STORAGE_KEY_POPUP); });

    // Trigger 1: exit-intent (desktop) — mouse sai pelo topo da janela
    function onMouseLeave(e) {
      if (e.clientY <= 0) open();
    }
    document.addEventListener('mouseleave', onMouseLeave);

    // Trigger 2: profundidade de rolagem (funciona em mobile também)
    function onScroll() {
      var scrolled = window.scrollY + window.innerHeight;
      var full = document.documentElement.scrollHeight;
      if (full > 0 && scrolled / full >= SCROLL_TRIGGER_PCT) open();
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // Trigger 3: fallback de tempo, garante exibição mesmo sem scroll/exit-intent
    timeoutId = setTimeout(open, TIME_TRIGGER_MS);
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initBanner();
    initPopup();
  });
})();
