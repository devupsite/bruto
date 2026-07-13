/* ════════════════════════════════════════════
   EXIT-INTENT — oferta do guia PDF em troca de contato
   Injetado via JS em todas as páginas (mesmo padrão do
   cookie-consent.js / back-to-top.js). Desktop: dispara
   quando o mouse sai por cima da viewport (indicando
   intenção de fechar aba/voltar). Mobile: dispara depois
   de um tempo de engajamento, já que não existe gesto
   equivalente confiável. Aparece no máximo 1x por sessão
   (sessionStorage) e nunca na página do quiz.
════════════════════════════════════════════ */
(function () {
  'use strict';

  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/xbdveedy';
  var SESSION_KEY = 'bruto_exit_intent_shown';
  var MOBILE_DELAY_MS = 45000;

  // Não roda na página do quiz — seria interromper um fluxo já engajado
  if (document.getElementById('quiz-progress')) return;

  function jaMostrado() {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
  }
  function marcarMostrado() {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
  }

  var overlay, modal, shown = false;

  function montar() {
    overlay = document.createElement('div');
    overlay.className = 'exit-intent__overlay';

    modal = document.createElement('div');
    modal.className = 'exit-intent__modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Receba o guia de aplicação gratuito');
    modal.innerHTML =
      '<button type="button" class="exit-intent__close" aria-label="Fechar">' +
        '<i class="ti ti-x" aria-hidden="true"></i>' +
      '</button>' +
      '<i class="ti ti-file-download exit-intent__icon" aria-hidden="true"></i>' +
      '<p class="exit-intent__eyebrow">Antes de você ir</p>' +
      '<h2 class="exit-intent__title">Leve o guia de aplicação gratuito</h2>' +
      '<p class="exit-intent__body">Passo a passo completo de preparação, argamassa e rejunte — direto no seu WhatsApp.</p>' +
      '<form class="exit-intent__form" id="exit-intent-form">' +
        '<input type="text" name="nome" placeholder="Seu nome" required class="exit-intent__input">' +
        '<input type="tel" name="whatsapp" placeholder="WhatsApp com DDD" required class="exit-intent__input">' +
        '<button type="submit" class="btn btn--solid exit-intent__submit">' +
          '<i class="ti ti-download" aria-hidden="true"></i> Quero o guia grátis' +
        '</button>' +
      '</form>' +
      '<p class="exit-intent__disclaimer">Sem spam. Só o guia e, se topar, novidades da Bruto.</p>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) fechar();
    });
    modal.querySelector('.exit-intent__close').addEventListener('click', fechar);

    modal.querySelector('#exit-intent-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = e.target.nome.value.trim();
      var whatsapp = e.target.whatsapp.value.trim();
      if (!nome || !whatsapp) return;

      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ nome: nome, whatsapp: whatsapp, origem: 'exit-intent-guia-pdf', pagina: window.location.pathname })
      }).catch(function () { /* não bloqueia o download se o Formspree falhar */ });

      if (window.brutoTrack) {
        window.brutoTrack('form_submit', { form_type: 'exit-intent-guia-pdf' });
      }

      // download do PDF direto
      var a = document.createElement('a');
      a.href = 'guia-aplicacao-bruto.pdf';
      a.download = 'guia-aplicacao-bruto.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();

      modal.innerHTML =
        '<button type="button" class="exit-intent__close" aria-label="Fechar"><i class="ti ti-x" aria-hidden="true"></i></button>' +
        '<i class="ti ti-circle-check exit-intent__icon exit-intent__icon--ok" aria-hidden="true"></i>' +
        '<h2 class="exit-intent__title">Guia a caminho!</h2>' +
        '<p class="exit-intent__body">O download começou. Se precisar, nosso time também pode te ajudar direto pelo WhatsApp.</p>' +
        '<a href="https://wa.me/5511990049468?text=' + encodeURIComponent('Olá! Baixei o guia de aplicação e queria mais informações.') + '" target="_blank" rel="noopener" class="btn btn--outline exit-intent__submit">' +
          '<i class="ti ti-brand-whatsapp" aria-hidden="true"></i> Falar no WhatsApp' +
        '</a>';
      modal.querySelector('.exit-intent__close').addEventListener('click', fechar);
    });
  }

  function abrir() {
    if (shown || jaMostrado()) return;
    shown = true;
    marcarMostrado();
    if (!overlay) montar();
    requestAnimationFrame(function () {
      overlay.classList.add('is-visible');
    });
    if (window.brutoTrack) window.brutoTrack('exit_intent_shown', { page_path: window.location.pathname });
  }

  function fechar() {
    if (overlay) overlay.classList.remove('is-visible');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var isTouch = window.matchMedia('(pointer: coarse)').matches;

    if (isTouch) {
      setTimeout(abrir, MOBILE_DELAY_MS);
    } else {
      document.addEventListener('mouseleave', function (e) {
        if (e.clientY <= 0) abrir();
      });
    }
  });
})();
