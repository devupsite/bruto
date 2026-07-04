/* ════════════════════════════════════════════
   HEADER — efeito de encolher ao rolar
   + esconde ao rolar pra baixo / reaparece ao rolar pra cima (mobile)
   + fecha o menu mobile automaticamente ao rolar
   Carregado em todas as páginas do site.
════════════════════════════════════════════ */
(function () {
  'use strict';

  var header = document.querySelector('.header');
  if (!header) return;

  var THRESHOLD = 24;      // px de rolagem antes de encolher
  var HIDE_THRESHOLD = 80; // px de rolagem antes de poder esconder (evita esconder logo no topo)
  var isMobile = window.matchMedia('(max-width: 600px)');

  var mainNav = document.getElementById('main-nav');
  var menuBtn = document.getElementById('menu-btn');

  var lastY = window.scrollY;

  function closeMobileMenu() {
    if (!mainNav || !mainNav.classList.contains('nav--open')) return;
    mainNav.classList.remove('nav--open');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false');
      var icon = menuBtn.querySelector('i');
      if (icon) icon.className = 'ti ti-menu-2';
    }
  }

  function onScroll() {
    var y = window.scrollY;

    if (y > THRESHOLD) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    // esconder/mostrar só no mobile — no desktop o header nunca some
    if (isMobile.matches && !(mainNav && mainNav.classList.contains('nav--open'))) {
      if (y > lastY && y > HIDE_THRESHOLD) {
        header.classList.add('is-hidden');   // rolando pra baixo
      } else if (y < lastY) {
        header.classList.remove('is-hidden'); // rolando pra cima
      }
    } else {
      header.classList.remove('is-hidden');
    }

    lastY = y;
    closeMobileMenu();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // aplica o estado correto já no load (ex.: reload com scroll restaurado)
})();
