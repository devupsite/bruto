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

  function textureUrl(id)  { return id + '-frontal.webp'; }
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
    // Monta o reticulado H/V no espaço LOCAL (não-rotacionado) — cada par
    // peça-horizontal + peça-vertical tesselada sem gap nem sobreposição,
    // igual a qualquer piso corrido comum — e só depois rotaciona o conjunto
    // inteiro em 45° ao redor do centro da parede. Rotacionar cada peça
    // individualmente (+45/-45) na mesma posição, como era antes, faz elas
    // se cruzarem em "X" ao invés de formar o zigue-zague do espinha de
    // peixe de verdade.
    var rects = [];
    var thick = L / 2; // proporção clássica 2:1 (comprimento : espessura)
    var period = L + thick;

    var originX = wallW / 2;
    var originY = wallH / 2;
    var cos45 = Math.SQRT1_2;
    var sin45 = Math.SQRT1_2;

    function rotateAroundCenter(px, py) {
      var dx = px - originX;
      var dy = py - originY;
      return {
        x: originX + dx * cos45 - dy * sin45,
        y: originY + dx * sin45 + dy * cos45
      };
    }

    var halfDiag = Math.sqrt(Math.pow(wallW / 2, 2) + Math.pow(wallH / 2, 2));
    var steps = Math.ceil(halfDiag / period) + 3;

    for (var r = -steps; r <= steps; r++) {
      var y = r * period;
      for (var c = -steps; c <= steps; c++) {
        var x = c * period;

        // peça horizontal do par (0° local)
        var hCenter = rotateAroundCenter(x + L / 2, y + thick / 2);
        rects.push({ x: hCenter.x - L / 2, y: hCenter.y - thick / 2, w: L, h: thick, rot: 45 });

        // peça vertical do par (90° local), encaixada à direita e acima da horizontal
        var vCenter = rotateAroundCenter(x + L + thick / 2, y - thick + L / 2);
        rects.push({ x: vCenter.x - thick / 2, y: vCenter.y - L / 2, w: thick, h: L, rot: 135 });
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
