/* ============================================================
   ANALYTICS — eventos de conversão para GTM
   ============================================================
   Este arquivo empurra eventos para o dataLayer em pontos-chave
   de conversão. O GTM (Google Tag Manager) já deve estar
   instalado em todas as páginas (ver comentário no <head> de
   cada HTML) — a partir daí, dentro do painel do GTM, basta
   criar "Triggers" de Custom Event com os nomes abaixo e
   conectar às tags do Meta Pixel / Google Ads / GA4.

   Eventos disparados por este arquivo:
   - whatsapp_click     → clique em qualquer link wa.me
   - amostra_click      → clique em "Solicitar amostra"
   - pdf_lead_download  → download do PDF de orçamento (calculadora)
   - form_submit        → envio de formulário (Formspree)
   ============================================================ */

(function () {
  window.dataLayer = window.dataLayer || [];

  function track(eventName, params) {
    window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
  }

  document.addEventListener('DOMContentLoaded', function () {

    // ── WhatsApp: qualquer link wa.me na página ──
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (link) {
      link.addEventListener('click', function () {
        track('whatsapp_click', {
          link_text: link.textContent.trim().slice(0, 60),
          page_path: window.location.pathname
        });
      });
    });

    // ── Solicitar amostra / orçamento ──
    document.querySelectorAll('a[href*="#amostra"]').forEach(function (link) {
      link.addEventListener('click', function () {
        track('amostra_click', { page_path: window.location.pathname });
      });
    });

    // ── PDF de orçamento (botão da calculadora, se existir na página) ──
    var pdfBtn = document.getElementById('lead-pdf-open');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', function () {
        track('pdf_lead_download', {
          product_name: pdfBtn.dataset.productName || '',
          product_line: pdfBtn.dataset.productLine || '',
          page_path: window.location.pathname
        });
      });
    }

  });

  // Exposto globalmente para outros scripts (ex: lead-pdf.js) chamarem
  // track('form_submit', {...}) após confirmação real de envio ao Formspree.
  window.brutoTrack = track;
})();
