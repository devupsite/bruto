/* ════════════════════════════════════════════
   COOKIE CONSENT — banner de privacidade
   Carregado em todas as páginas do site.
════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'bruto_cookie_consent'; // { analytics: bool, ts: number }

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(analytics) {
    var value = { analytics: !!analytics, ts: Date.now() };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch (e) {}
    // Outros scripts (ex.: um futuro loader de analytics) podem escutar este
    // evento pra só carregar depois de consentimento explícito.
    try {
      document.dispatchEvent(new CustomEvent('bruto:cookieconsent', { detail: value }));
    } catch (e) {}
  }

  // privacidade.html está sempre na raiz do site, então funciona a partir de
  // qualquer página (inclusive as que estão em subpastas, se existirem).
  function privacyHref(anchor) {
    return 'privacidade.html' + (anchor ? '#' + anchor : '');
  }

  function buildBanner() {
    var el = document.createElement('div');
    el.className = 'cookie-consent';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Controle de privacidade e cookies');
    el.innerHTML =
      '<div class="cookie-consent__head">' +
        '<span class="cookie-consent__title">Controle sua privacidade</span>' +
      '</div>' +
      '<p class="cookie-consent__text">' +
        'Usamos cookies para melhorar sua experiência no site e entender como ele é usado. ' +
        'Ao ACEITAR, você concorda com a utilização e compreende nossa Política de Privacidade.' +
      '</p>' +
      '<div class="cookie-consent__panel" id="cookie-consent-panel">' +
        '<div class="cookie-consent__option">' +
          '<div>' +
            '<div class="cookie-consent__option-name">Cookies essenciais</div>' +
            '<div class="cookie-consent__option-desc">Necessários para o site funcionar (ex.: lembrar que você já viu o aviso de frete). Não podem ser desativados.</div>' +
          '</div>' +
          '<input type="checkbox" class="cookie-consent__switch" checked disabled aria-label="Cookies essenciais, sempre ativos">' +
        '</div>' +
        '<div class="cookie-consent__option">' +
          '<div>' +
            '<div class="cookie-consent__option-name">Cookies de análise</div>' +
            '<div class="cookie-consent__option-desc">Ajudam a entender como o site é usado, pra melhorar conteúdo e navegação.</div>' +
          '</div>' +
          '<input type="checkbox" class="cookie-consent__switch" id="cookie-consent-analytics" aria-label="Ativar cookies de análise">' +
        '</div>' +
      '</div>' +
      '<div class="cookie-consent__links">' +
        '<a href="' + privacyHref() + '">Política de Privacidade</a>' +
        '<span>·</span>' +
        '<a href="' + privacyHref('cookies') + '">Política de Cookies</a>' +
        '<span>·</span>' +
        '<a href="termos.html">Termos de uso</a>' +
        '<span>·</span>' +
        '<button type="button" id="cookie-consent-prefs-toggle">Preferências</button>' +
      '</div>' +
      '<div class="cookie-consent__actions">' +
        '<button type="button" class="cookie-consent__btn cookie-consent__btn--ghost" id="cookie-consent-reject">Rejeitar</button>' +
        '<button type="button" class="cookie-consent__btn cookie-consent__btn--solid" id="cookie-consent-accept">Aceitar</button>' +
      '</div>';
    return el;
  }

  function buildReopenButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cookie-consent__reopen';
    btn.setAttribute('aria-label', 'Abrir preferências de cookies');
    btn.innerHTML = '<i class="ti ti-cookie" aria-hidden="true"></i>';
    return btn;
  }

  function init() {
    var existing = getConsent();
    var reopenBtn = buildReopenButton();
    document.body.appendChild(reopenBtn);

    function showReopen() {
      requestAnimationFrame(function () { reopenBtn.classList.add('is-visible'); });
    }

    function openBanner(prefill) {
      var banner = buildBanner();
      document.body.appendChild(banner);
      requestAnimationFrame(function () { banner.classList.add('is-visible'); });

      var panel = banner.querySelector('#cookie-consent-panel');
      var analyticsToggle = banner.querySelector('#cookie-consent-analytics');
      if (prefill) analyticsToggle.checked = !!prefill.analytics;

      banner.querySelector('#cookie-consent-prefs-toggle').addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });

      function close() {
        banner.classList.remove('is-visible');
        setTimeout(function () { banner.remove(); }, 250);
        showReopen();
      }

      banner.querySelector('#cookie-consent-accept').addEventListener('click', function () {
        // Aceitar aqui aceita tudo, inclusive o que estiver marcado no painel de preferências.
        setConsent(true);
        close();
      });

      banner.querySelector('#cookie-consent-reject').addEventListener('click', function () {
        setConsent(false);
        close();
      });

      // Se o painel de preferências estiver aberto e a pessoa marcar só
      // "análise", o botão Aceitar já reflete a escolha granular feita ali.
      analyticsToggle.addEventListener('change', function () {
        banner.querySelector('#cookie-consent-accept').onclick = function () {
          setConsent(analyticsToggle.checked);
          close();
        };
      });

      reopenBtn.classList.remove('is-visible');
    }

    reopenBtn.addEventListener('click', function () {
      if (document.querySelector('.cookie-consent')) return;
      openBanner(getConsent());
    });

    if (!existing) {
      openBanner(null);
    } else {
      showReopen();
    }
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(init);
})();
