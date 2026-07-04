/* ════════════════════════════════════════════
   HEADER — efeito de encolher ao rolar
   Carregado em todas as páginas do site.
════════════════════════════════════════════ */
(function () {
  'use strict';

  var header = document.querySelector('.header');
  if (!header) return;

  var THRESHOLD = 24; // px de rolagem antes de encolher

  function onScroll() {
    if (window.scrollY > THRESHOLD) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // aplica o estado correto já no load (ex.: reload com scroll restaurado)
})();
