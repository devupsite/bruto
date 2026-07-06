/* ============================================================
   BRUTO — Simulador de Paginação & Cor
   Renderiza os padrões de assentamento usando a textura real
   (foto) de cada tijolo da coleção Brick, com seletor de cor
   e toggle de ambiente claro/escuro.
   ============================================================ */

(function () {

  // Coleção Brick — id, nome de exibição, foto principal e thumb
  var BRICKS = [
    { id: 'brick-branco-rose',          nome: 'Branco Rosé' },
    { id: 'brick-eco-palha',            nome: 'Eco Palha' },
    { id: 'brick-lumus',                nome: 'Lumus' },
    { id: 'brick-mescla-prime',         nome: 'Mescla Prime' },
    { id: 'brick-natura',               nome: 'Natura' },
    { id: 'brick-rosso-prime',          nome: 'Rosso Prime' },
    { id: 'brick-rusticatto-sertao',    nome: 'Rusticatto do Sertão' },
    { id: 'brick-rusticatto-fume',      nome: 'Rusticatto Fumê' },
    { id: 'brick-rusticatto-rosso',     nome: 'Rusticatto Rosso' },
    { id: 'brick-rusticatto-terra-negra', nome: 'Rusticatto Terra Negra' },
    { id: 'brick-terra-cerrado',        nome: 'Terra do Cerrado' },
    { id: 'brick-vulcano',              nome: 'Vulcano' }
  ];

  function textureUrl(id)  { return id + '-frontal-1.webp'; }
  function thumbUrl(id)    { return id + '-frontal-thumb.webp'; }
  function findBrick(id)   { return BRICKS.filter(function (b) { return b.id === id; })[0] || BRICKS[0]; }

  var PATTERNS = [
    { id: 'corrido12', label: 'Corrido 1/2',    desc: 'O clássico — deslocamento de meia peça a cada fiada.' },
    { id: 'corrido13', label: 'Corrido 1/3',     desc: 'Deslocamento de um terço, ritmo mais alongado.' },
    { id: 'empilhado', label: 'Empilhado',       desc: 'Sem deslocamento — grid puro, leitura industrial.' },
    { id: 'espinha',   label: 'Espinha de Peixe', desc: 'Peças em 45° alternadas — acabamento premium.' }
  ];

  /* ---------- Geradores de layout (retângulos por padrão) ---------- */

  function genCorrido(wallW, wallH, mw, mh, gap, offsetFrac) {
    var rects = [];
    var stepY = mh + gap;
    var stepX = mw + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    for (var r = -1; r < rows; r++) {
      var y = r * stepY;
      var off = (offsetFrac === 0.5) ? ((Math.abs(r) % 2) * mw * 0.5)
                                      : ((((r % 3) + 3) % 3) * mw / 3);
      var cols = Math.ceil((wallW + mw * 2) / stepX) + 2;
      for (var c = -2; c < cols; c++) {
        var x = c * stepX - off;
        rects.push({ x: x, y: y, w: mw, h: mh, rot: 0 });
      }
    }
    return rects;
  }

  function genEmpilhado(wallW, wallH, mw, mh, gap) {
    var rects = [];
    var stepY = mh + gap;
    var stepX = mw + gap;
    var rows = Math.ceil(wallH / stepY) + 2;
    var cols = Math.ceil(wallW / stepX) + 2;
    for (var r = -1; r < rows; r++) {
      for (var c = -1; c < cols; c++) {
        rects.push({ x: c * stepX, y: r * stepY, w: mw, h: mh, rot: 0 });
      }
    }
    return rects;
  }

  function genEspinha(wallW, wallH, L) {
    var rects = [];
    var thick = L * 0.34;
    var rowH = thick * 2 + 2;
    var colW = L * 0.72;
    var rows = Math.ceil(wallH / rowH) + 3;
    var cols = Math.ceil(wallW / colW) + 3;
    for (var r = -2; r < rows; r++) {
      var y = r * rowH;
      for (var c = -2; c < cols; c++) {
        var x = c * colW + (r % 2 ? colW / 2 : 0);
        rects.push({ x: x, y: y, w: L, h: thick, rot: 45, cx: x + L / 2, cy: y + thick / 2 });
        rects.push({ x: x, y: y + rowH / 2, w: L, h: thick, rot: -45, cx: x + L / 2, cy: y + rowH / 2 + thick / 2 });
      }
    }
    return rects;
  }

  function buildLayout(patternId, wallW, wallH) {
    var mw = Math.max(48, wallW / 7.5);
    var mh = mw / 3.65;
    var gap = Math.max(1.5, mw * 0.045);
    switch (patternId) {
      case 'corrido13': return genCorrido(wallW, wallH, mw, mh, gap, 1 / 3);
      case 'empilhado':  return genEmpilhado(wallW, wallH, mw, mh, gap);
      case 'espinha':    return genEspinha(wallW, wallH, mw * 1.35);
      case 'corrido12':
      default:           return genCorrido(wallW, wallH, mw, mh, gap, 0.5);
    }
  }

  /* ---------- Renderização ---------- */

  function renderWall(root, state) {
    var wallEl = root.querySelector('.pgn-wall');
    if (!wallEl) return;

    var rectW = wallEl.clientWidth;
    var rectH = wallEl.clientHeight;
    if (!rectW || !rectH) return;

    var layout = buildLayout(state.pattern, rectW, rectH);
    var url = "url('" + textureUrl(state.brickId) + "')";
    var frag = document.createDocumentFragment();

    layout.forEach(function (b) {
      var el = document.createElement('div');
      el.className = 'pgn-brick';
      el.style.left = b.x + 'px';
      el.style.top = b.y + 'px';
      el.style.width = b.w + 'px';
      el.style.height = b.h + 'px';

      if (b.rot) {
        el.style.transformOrigin = 'center center';
        el.style.transform = 'rotate(' + b.rot + 'deg)';
        el.style.backgroundImage = url;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = '50% 50%';
      } else {
        // truque de "janela reveladora": a textura cobre toda a
        // parede numa única escala e cada peça revela seu recorte,
        // criando continuidade fotográfica entre as peças.
        el.style.backgroundImage = url;
        el.style.backgroundSize = rectW + 'px ' + rectH + 'px';
        el.style.backgroundPosition = (-b.x) + 'px ' + (-b.y) + 'px';
      }
      frag.appendChild(el);
    });

    wallEl.innerHTML = '';
    wallEl.appendChild(frag);
  }

  /* ---------- Montagem do widget ---------- */

  function buildSwatches(root, state, onChange) {
    var wrap = root.querySelector('.pgn-swatches');
    if (!wrap) return;
    wrap.innerHTML = '';
    BRICKS.forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pgn-swatch' + (b.id === state.brickId ? ' is-active' : '');
      btn.setAttribute('data-brick', b.id);
      btn.setAttribute('title', b.nome);
      btn.setAttribute('aria-label', b.nome);
      btn.innerHTML = '<img src="' + thumbUrl(b.id) + '" alt="' + b.nome + '" loading="lazy">';
      btn.addEventListener('click', function () {
        if (state.brickId === b.id) return;
        state.brickId = b.id;
        wrap.querySelectorAll('.pgn-swatch').forEach(function (s) { s.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var label = root.querySelector('.pgn-current-name');
        if (label) label.textContent = b.nome;
        onChange();
      });
      wrap.appendChild(btn);
    });
  }

  function buildPatternButtons(root, state, onChange) {
    var wrap = root.querySelector('.pgn-pattern-list');
    if (!wrap) return;
    wrap.innerHTML = '';
    PATTERNS.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pgn-pattern-btn' + (p.id === state.pattern ? ' is-active' : '');
      btn.setAttribute('data-pattern', p.id);
      btn.textContent = p.label;
      btn.addEventListener('click', function () {
        if (state.pattern === p.id) return;
        state.pattern = p.id;
        wrap.querySelectorAll('.pgn-pattern-btn').forEach(function (s) { s.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var desc = root.querySelector('.pgn-pattern-desc');
        if (desc) desc.textContent = p.desc;
        onChange();
      });
      wrap.appendChild(btn);
    });
  }

  function buildAmbientToggle(root, state) {
    var wrap = root.querySelector('.pgn-ambient-toggle');
    if (!wrap) return;
    wrap.querySelectorAll('.pgn-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var val = btn.getAttribute('data-ambient');
        if (state.ambiente === val) return;
        state.ambiente = val;
        wrap.querySelectorAll('.pgn-chip').forEach(function (s) { s.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var wallWrap = root.querySelector('.pgn-preview-wrap');
        if (wallWrap) {
          wallWrap.classList.toggle('pgn-ambient--escuro', val === 'escuro');
          wallWrap.classList.toggle('pgn-ambient--claro', val === 'claro');
        }
      });
    });
  }

  function initOne(root) {
    var initialId = root.getAttribute('data-current') || BRICKS[0].id;
    var state = { brickId: findBrick(initialId).id, pattern: 'corrido12', ambiente: 'claro' };

    var nameLabel = root.querySelector('.pgn-current-name');
    if (nameLabel) nameLabel.textContent = findBrick(state.brickId).nome;

    var descLabel = root.querySelector('.pgn-pattern-desc');
    if (descLabel) descLabel.textContent = PATTERNS[0].desc;

    function rerender() { renderWall(root, state); }

    buildSwatches(root, state, rerender);
    buildPatternButtons(root, state, rerender);
    buildAmbientToggle(root, state);

    rerender();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rerender, 150);
    });
  }

  function initPaginacoes() {
    var roots = document.querySelectorAll('.pgn-section[data-current]');
    roots.forEach ? roots.forEach(initOne) : Array.prototype.forEach.call(roots, initOne);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPaginacoes);
  } else {
    initPaginacoes();
  }

  window.BrutoPaginacoes = { init: initPaginacoes };

})();
