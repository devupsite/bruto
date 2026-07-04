/* ════════════════════════════════════════════
   HEADER — efeito de encolher ao rolar
   + fecha o menu mobile automaticamente ao rolar
   Carregado em todas as páginas do site.
════════════════════════════════════════════ */
(function () {
  'use strict';

  var header = document.querySelector('.header');
  if (!header) return;

  var THRESHOLD = 24; // px de rolagem antes de encolher

  var mainNav = document.getElementById('main-nav');
  var menuBtn = document.getElementById('menu-btn');

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
    if (window.scrollY > THRESHOLD) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    closeMobileMenu();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // aplica o estado correto já no load (ex.: reload com scroll restaurado)
})();
