/* ════════════════════════════════════════════
   BACK TO TOP — seta flutuante
   Carregado em todas as páginas do site.
════════════════════════════════════════════ */
(function () {
  'use strict';

  var THRESHOLD = 400; // px de rolagem antes de aparecer

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Voltar ao topo');
  btn.innerHTML = '<i class="ti ti-arrow-up" aria-hidden="true"></i>';
  document.body.appendChild(btn);

  function onScroll() {
    if (window.scrollY > THRESHOLD) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
