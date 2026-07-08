/* ════════════════════════════════════════════════════════════════
   PARCELAMENTO — calcula e renderiza Pix + parcelas a partir do
   preço já exibido em .price (mesmo padrão usado pela calculadora
   de quantidade). Tabela é INFORMATIVA — não há gateway de
   pagamento ativo ainda. Ver COLABORACAO.md item "tabela de
   parcelamento" para contexto.

   Lógica:
   - Pix: 10% de desconto sobre o preço /m² exibido
   - 1x a 4x: preço cheio, sem juros
   - 5x a 12x: Tabela Price, juros de 4,5% a.m. (padrão de mercado,
     mesma referência usada pela Cerâmica Faion)
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var JUROS_MENSAL = 0.045;
  var DESCONTO_PIX = 0.10;

  function formatBRL(v) {
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function parcelaComJuros(preco, n) {
    // Tabela Price: PMT = PV * i / (1 - (1+i)^-n)
    var i = JUROS_MENSAL;
    var pmt = preco * i / (1 - Math.pow(1 + i, -n));
    return pmt;
  }

  function buildRows(preco) {
    var rows = [];
    for (var n = 1; n <= 4; n++) {
      rows.push({ n: n, valor: preco / n, total: preco, juros: false });
    }
    for (var m = 5; m <= 12; m++) {
      var parcela = parcelaComJuros(preco, m);
      rows.push({ n: m, valor: parcela, total: parcela * m, juros: true });
    }
    return rows;
  }

  function render(container, preco) {
    var pix = preco * (1 - DESCONTO_PIX);
    var rows = buildRows(preco);

    var html = '';
    html += '<div class="price-parc">';
    html += '  <div class="price-parc__pix">';
    html += '    <span class="price-parc__pix-badge">10% OFF NO PIX</span>';
    html += '    <span class="price-parc__pix-val">R$ ' + formatBRL(pix) + '<span class="price__unit"> /m²</span></span>';
    html += '  </div>';
    html += '  <p class="price-parc__main">até <strong>4x de R$ ' + formatBRL(preco / 4) + '</strong> sem juros no cartão</p>';
    html += '  <button type="button" class="price-parc__toggle" aria-expanded="false">';
    html += '    Ver todas as parcelas <i class="ti ti-chevron-down" aria-hidden="true"></i>';
    html += '  </button>';
    html += '  <div class="price-parc__table" hidden>';
    html += '    <table>';
    html += '      <thead><tr><th>Parcelas</th><th>Valor</th><th>Total</th><th>Juros?</th></tr></thead>';
    html += '      <tbody>';
    rows.forEach(function (r) {
      html += '<tr' + (r.juros ? ' class="is-juros"' : '') + '>';
      html += '<td>' + r.n + 'x</td>';
      html += '<td>R$ ' + formatBRL(r.valor) + '</td>';
      html += '<td>R$ ' + formatBRL(r.total) + '</td>';
      html += '<td>' + (r.juros ? 'Sim' : 'Não') + '</td>';
      html += '</tr>';
    });
    html += '      </tbody>';
    html += '    </table>';
    html += '    <p class="price-parc__disclaimer">Valores informativos — parcelamento com juros de 4,5% a.m. (Tabela Price). Sujeito à confirmação no fechamento do pedido.</p>';
    html += '  </div>';
    html += '</div>';

    container.innerHTML = html;

    var toggle = container.querySelector('.price-parc__toggle');
    var table = container.querySelector('.price-parc__table');
    toggle.addEventListener('click', function () {
      var open = !table.hidden;
      table.hidden = open;
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.innerHTML = open
        ? 'Ver todas as parcelas <i class="ti ti-chevron-down" aria-hidden="true"></i>'
        : 'Ocultar parcelas <i class="ti ti-chevron-up" aria-hidden="true"></i>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var priceEl = document.querySelector('.price');
    var container = document.getElementById('parcelamento-info');
    if (!priceEl || !container) return;

    var raw = priceEl.textContent.replace(/[^0-9,]/g, '').replace(',', '.');
    var preco = parseFloat(raw) || 0;
    if (preco <= 0) return;

    render(container, preco);
  });
})();
